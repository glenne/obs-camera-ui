import { Camera, CameraPreset } from './CameraTypes';
import * as DigestFetch from 'digest-fetch';
import { getCamState, logError, setCamSending, updateCamState } from './AppState';

export const applyCamPreset = async (cam: Camera | undefined, preset: CameraPreset) => {
  if (!cam || !preset || !preset.preset) {
    return;
  }
  // console.log(JSON.stringify({from: getCamState()[cam.name]?.preset?.preset, to: preset.preset}))
  if (getCamState()[cam.name]?.preset?.preset === preset.preset) {
    // Already there
    return;
  }
  setCamSending(true);
  let err = '';
  logError('Camera', '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    //const url = `http://${cam.ip}/cgi-bin/ptz.cgi?action=start&code=GotoPreset&arg1=0&arg2=5&arg3=0&channel=${preset.preset}`;
    const host = window.location.hostname || '127.0.0.1';
    const url = `http://${host}:8080/?preset=${preset.preset}&cam=${cam.name}&camip=${cam.ip}&camuser=${cam.user}&campw=${cam.password}&camvendor=${cam.vendor}`;
    // console.log('url=', url);
    new DigestFetch(cam.user, cam.password, { algorithm: 'MD5' });
    const response = await fetch(url, { signal: controller.signal, mode: 'no-cors' });
    // console.log('response was ' + JSON.stringify(response.headers));
  } catch (e) {
    err = e.message;
    logError(cam.name, `Updating ${cam.name} cam to preset ${preset.preset} : ${err}`);
  } finally {
    clearTimeout(timeoutId);
    setCamSending(false);
    updateCamState(cam, preset, err);
  }
};
