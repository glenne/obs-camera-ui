import OBSWebSocket from 'obs-websocket-js';
import { UseDatum } from 'react-usedatum';
import {
  DefaultCamScene,
  findCamScene,
  getCameraList,
  getLastCamSelected,
  getOBSConfig,
  logError,
  setCurrentLiveScene,
  setCurrentPreviewScene,
  setLastCamSelected,
  updateCamState,
} from './AppState';
import { applyCamPreset } from './CamUtil';
const obs = new OBSWebSocket();
let obsInitialized = false;

// - [OBS Remote API](https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/)
export const [useOBSConnected, setOBSConnected, getOBSConnected] = UseDatum(false);

const connectOBS = () => {
  const config = getOBSConfig();
  if (getOBSConnected() || !config) {
    return;
  }

  if (!obsInitialized) {
    obsInitialized = true;
    obs.on('CurrentProgramSceneChanged', (data) => {
      const obsScene = data.sceneName;
      console.log(`New Active Scene: ${obsScene}`);
      const scene = findCamScene(obsScene);
      if (scene) {
        setLastCamSelected(scene.cam.name);
        setCurrentLiveScene(scene);
        // Only change cam on preview changes
      }
    });

    obs.on('CurrentPreviewSceneChanged', (data) => {
      const obsScene = data.sceneName;
      console.log(`New Preview Scene: ${obsScene}`);
      const scene = findCamScene(obsScene);
      if (!scene) {
        setCurrentPreviewScene(DefaultCamScene);
        return;
      } else {
        setCurrentPreviewScene(scene);
      }
      if (getLastCamSelected() !== scene.cam.name) {
        // Apply matching camera selection since the target cam is not active
        applyCamPreset(scene.cam, scene.scene);
      } else {
        // Take note of the change but don't auto-trigger the camera to update also
        updateCamState(scene.cam, scene.scene);
      }
    });

    obs.on('ConnectionClosed', (data) => setOBSConnected(false));

    obs.on('SceneTransitionStarted', (data) => {
      // console.log('transitioning', JSON.stringify(data));
      const obsScene = data.transitionName;
      let scene = findCamScene(obsScene) || DefaultCamScene;
      setCurrentLiveScene(scene);
      if (scene.scene.preset > 0) {
        applyCamPreset(scene.cam, scene.scene);
      }
      // console.log(`Transition Scene: ${obsScene} from ${data.fromScene}`);
      // scene = findCamScene(data['from-scene']) || DefaultCamScene;
      // setCurrentPreviewScene(scene);

    });

    // You must add this handler to avoid uncaught exceptions.
    // obs.on('error', (err) => {
    //   console.error('socket error:', err);
    // });
  }

  const host = config.host ? config.host : window.location.hostname || 'localhost';
  console.log(`connecting to ${JSON.stringify(config)}`);
  obs
    .connect(`ws://${host}:${config.port}`, config.password)
    .then(() => {
      console.log(`Success! We're connected & authenticated.`);
      logError('OBS', '');
      setOBSConnected(true);

      return obs.call('GetSceneList');
    })
    .then((data) => {
      // console.log(JSON.stringify(data.scenes, null, 2))
      const errorScenes: string[] = [];
      for (const cam of getCameraList()) {
        cam.presets.forEach((preset) => {
          if (!preset.obsScene) {
            return;
          }
          if (!data.scenes.find((scene) => scene.sceneName === preset.obsScene)) {
            errorScenes.push(`'${preset.obsScene}'`);
          }
        });
      }
      if (errorScenes.length) {
        logError('OBS', `Missing OBS Scene: ${errorScenes.join(',')}`);
      }
      console.log(`${data.scenes.length} Available Scenes!`);
      console.log(`Current scene: ${data.currentProgramSceneName}`);
      let scene = findCamScene(data.currentProgramSceneName);
      setCurrentLiveScene(scene || DefaultCamScene);
      if (scene) {
        setLastCamSelected(scene.cam.name);
        applyCamPreset(scene.cam, scene.scene);
      }
      scene = findCamScene(data.currentPreviewSceneName);
      setCurrentPreviewScene(scene || DefaultCamScene);
      if (scene && getLastCamSelected() !== scene.cam.name) {
        applyCamPreset(scene.cam, scene.scene);
      }
    })
    .catch((err) => {
      logError('OBS', `OBS Connect: ${String(err.error)}`);
      setOBSConnected(false);
      // Promise convention dicates you have a catch on every chain.
      // console.log(err.error);
    });
};

let obsTimer: NodeJS.Timeout | undefined;

export const startOBSMonitor = () => {
  setImmediate(connectOBS);
  obsTimer = setInterval(connectOBS, 5000);
};

export const stopOBSMonitor = () => {
  if (obsTimer) {
    clearTimeout(obsTimer);
    obsTimer = undefined;
  }
  obs.disconnect();
};

export const setPreviewScene = (obsScene: string) => {
  if (!obsScene || !getOBSConnected()) {
    return;
  }
  obs.call('SetCurrentPreviewScene', {
    'sceneName': obsScene,
  });
};

export const doOBSTransition = () => {
  obs.call('TriggerStudioModeTransition').then().catch();
};
