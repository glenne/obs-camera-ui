import { Camera, CameraPreset } from './CameraTypes';
// @ts-ignore
import * as DigestFetch from 'digest-fetch';
import { getCamState, logError, setCamSending, setCamState } from './AppState';

export const applyCamPreset = async (cam: Camera, preset: CameraPreset) => {
  setCamSending(true);
  let err = '';
  logError('');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    //const url = `http://${cam.ip}/cgi-bin/ptz.cgi?action=start&code=GotoPreset&arg1=0&arg2=5&arg3=0&channel=${preset.preset}`;
    const url = `http://localhost:8080/?preset=${preset.preset}&cam=${cam.name}`;
    console.log('url=', url);
    new DigestFetch(cam.user, cam.password, { algorithm: 'MD5' });
    const response = await fetch(url, { signal: controller.signal, mode: 'no-cors' });
    console.log('response was ' + JSON.stringify(response.headers));
  } catch (e) {
    err = e.message;
    logError(`Updating ${cam.name} cam to preset ${preset.preset} : ${err}`);
  } finally {
    clearTimeout(timeoutId);
    setCamSending(false);
    const camStateNext = getCamState();
    delete camStateNext[cam.name];
    camStateNext[cam.name] = { err, preset: preset.preset };
    setCamState(camStateNext, true);
  }
};
