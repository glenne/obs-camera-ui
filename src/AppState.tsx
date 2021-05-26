import { UseDatum } from 'react-usedatum';
import { CameraList, OBSConfig } from './CameraTypes';

export const [useErrorLog, setErrorLog] = UseDatum('');
export const logError = (msg: string) => {
  console.log(msg);
  setErrorLog(msg);
};
export const [useLastCamSelected, setLastCamSelected, getLastCamSelected] = UseDatum('');

export const [useCameraList, setCameraList, getCameraList] = UseDatum<CameraList>([]);
export const [useOBSConfig, setOBSConfig, getOBSConfig] = UseDatum<OBSConfig | undefined>(undefined);

export const [useCamState, setCamState, getCamState] = UseDatum<{ [name: string]: { preset: number; err: string } }>(
  {}
);

export const [useCamSending, setCamSending] = UseDatum(false);

// Utiltiy helpers
export const findCamScene = (obsScene: string) => {
  for (const cam of getCameraList()) {
    const scene = cam.presets.find((preset) => preset.obsScene === obsScene);
    if (scene) {
      return { cam, scene };
    }
  }
  return undefined;
};
