import OBSWebSocket from 'obs-websocket-js';
import { UseDatum } from 'react-usedatum';
import {
  findCamScene,
  getCameraList,
  getLastCamSelected,
  getOBSConfig,
  logError,
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
    obs.on('SwitchScenes', (data) => {
      const obsScene = data['scene-name'];
      console.log(`New Active Scene: ${obsScene}`);
      const scene = findCamScene(obsScene);
      if (scene) {
        setLastCamSelected(scene.cam.name);
        // Only change cam on preview changes
      }
    });

    obs.on('PreviewSceneChanged', (data) => {
      const obsScene = data['scene-name'];
      console.log(`New Preview Scene: ${obsScene}`);
      const scene = findCamScene(obsScene);
      if (!scene) {
        return;
      }
      if (getLastCamSelected() !== scene.cam.name) {
        applyCamPreset(scene.cam, scene.scene);
      } else {
        updateCamState(scene.cam, scene.scene);
      }
    });

    obs.on('ConnectionClosed', (data) => setOBSConnected(false));

    obs.on('TransitionBegin', (data) => {
      // console.log('transitioning', JSON.stringify(data));
      // const obsScene = data['to-scene'];
      // console.log(`New Active Scene: ${obsScene}`);
      // const scene = findCamScene(obsScene);
      // if (scene) {
      //   setLastCamSelected(scene.cam.name);
      //   applyCamPreset(scene.cam, scene.scene);
      // }
    });

    // You must add this handler to avoid uncaught exceptions.
    // obs.on('error', (err) => {
    //   console.error('socket error:', err);
    // });
  }

  console.log(`connecting to ${JSON.stringify(config)}`);
  obs
    .connect({ address: `${config.host}:${config.port}`, password: config.password })
    .then(() => {
      console.log(`Success! We're connected & authenticated.`);
      logError('OBS', '');
      setOBSConnected(true);

      return obs.send('GetSceneList');
    })
    .then((data) => {
      const errorScenes: string[] = [];
      for (const cam of getCameraList()) {
        cam.presets.forEach((preset) => {
          if (!preset.obsScene) {
            return;
          }
          if (!data.scenes.find((scene) => scene.name === preset.obsScene)) {
            errorScenes.push(`'${preset.obsScene}'`);
          }
        });
      }
      if (errorScenes.length) {
        logError('OBS', `Missing OBS Scene: ${errorScenes.join(',')}`);
      }
      console.log(`${data.scenes.length} Available Scenes!`);
      console.log(`Current scene: ${data['current-scene']}`);
      const scene = findCamScene(data['current-scene']);
      if (scene) {
        setLastCamSelected(scene.cam.name);
        applyCamPreset(scene.cam, scene.scene);
      }
      obs
        .send('GetPreviewScene')
        .then((data) => {
          console.log(`Current preview scene: ${data.name}`);
          const scene = findCamScene(data.name);
          if (scene && getLastCamSelected() !== scene.cam.name) {
            applyCamPreset(scene.cam, scene.scene);
          }
        })
        .catch();
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

export const applyOBSScene = (obsScene: string) => {
  if (!obsScene || !getOBSConnected()) {
    return;
  }
  obs.send('SetPreviewScene', {
    'scene-name': obsScene,
  });
};

export const doOBSTransition = () => {
  obs.send('TransitionToProgram', {}).then().catch();
};
