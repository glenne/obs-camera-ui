import { UseDatum } from 'react-usedatum';
import { Camera, CameraList, CameraPreset, OBSConfig } from './CameraTypes';

export const [useErrorLog, setErrorLog, getErrorLog] = UseDatum(new Map<string, string>());
export const logError = (tag: string, msg: string | undefined) => {
  console.log(`${tag}: ${msg}`);
  const errorLog = getErrorLog();
  if (!msg) {
    msg = undefined;
  }
  if (errorLog.get(tag) !== msg) {
    if (msg) {
      errorLog.set(tag, msg);
    } else {
      errorLog.delete(tag);
    }
    setErrorLog(errorLog, true);
  }
};
export const [useLastCamSelected, setLastCamSelected, getLastCamSelected] = UseDatum('');

export const [useCameraList, setCameraList, getCameraList] = UseDatum<CameraList>([]);
export const [useOBSConfig, setOBSConfig, getOBSConfig] = UseDatum<OBSConfig | undefined>(undefined);

export const [useCamState, setCamState, getCamState] = UseDatum<{
  [name: string]: { preset: CameraPreset; err: string };
}>({});

export const updateCamState = (cam: Camera, preset: CameraPreset, err: string = '') => {
  if (preset.obsScene) {
    const camStateNext = getCamState();
    delete camStateNext[cam.name];
    camStateNext[cam.name] = { err, preset };
    setCamState(camStateNext, true);
  }
};
export const [useCamSending, setCamSending] = UseDatum(false);

// Utiltiy helpers
export const findCamScene = (obsScene: string) => {
  for (const cam of getCameraList()) {
    const scene = cam.presets.find((preset) => preset.obsScene === obsScene);
    if (scene) {
      return { cam, scene };
    }
  }

  logError('OBS', `Scene not found: ${obsScene}`);
  return undefined;
};
