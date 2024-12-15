import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC } from 'react';
import { Camera } from './CameraTypes';
import * as DigestFetch from 'digest-fetch';
import { logError } from './AppState';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 4,
    marginRight: 4,
    height: 24 + theme.spacing(),
  },
  normal: {
  },
  button: {
    padding: 0,
    textTransform: 'none'
  },
  error: {
    background: '#d32f2f',
    '&:hover': {
      background: '#d32f2f',
    },
  },
  success: {
    background: '#388e3c',
    '&:hover': {
      background: '#388e3c',
    },
  },
  dim: {
    background: '#808080'
  },
  preview: {
    background: '#d0d000',
    '&:hover': {
      background: '#d0d000',
    },
  },
}));

export const sendMoveCommand = async (cam: Camera, action: string, direction: string) => {
  if (!cam || !direction) {
    return;
  }
  let err = '';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);
  try {
    //const url = `http://${cam.ip}/cgi-bin/ptz.cgi?action=start&code=GotoPreset&arg1=0&arg2=5&arg3=0&channel=${preset.preset}`;
    const host = window.location.hostname || '127.0.0.1';
    const url = `http://${host}:8080/?action=${action}&code=${direction}&cam=${cam.name}&camip=${cam.ip}&camuser=${cam.user}&campw=${cam.password}&camvendor=${cam.vendor}`;
    // console.log('url=', url);
    new DigestFetch(cam.user, cam.password, { algorithm: 'MD5' });
    await fetch(url, { signal: controller.signal, mode: 'no-cors' });
    // console.log('response was ' + JSON.stringify(response.headers));
  } catch (e) {
    err = e.message;
    logError(cam.name, `Updating ${cam.name} cam to ${action} ${direction} : ${err}`);
  } finally {
    clearTimeout(timeoutId);
  }
};
export interface CameraPresetProps {
  cam: Camera;
  direction: 'Left' | 'Right' | 'Up' | 'Down' | 'ZoomWide' | 'ZoomTele';
  dim?: boolean;
}

const Symbols = { 'Left': '<', 'Right': '>', 'Up': '^', 'Down': 'v', ZoomWide: '-', ZoomTele: '+' };

export const CameraMoveButton: FC<CameraPresetProps> = ({ cam, direction, dim }) => {
  const classes = useStyles();

  const onMouseDown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    sendMoveCommand(cam, 'start', direction);
  };
  const onMouseUp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { sendMoveCommand(cam, 'stop', direction); };

  return (
    <div className={classes.root}>
      <Button className={classes.button} size="small" variant="contained" onMouseDown={onMouseDown} onMouseUp={onMouseUp} >{Symbols[direction]}</Button>
    </div>
  );
};

export default CameraMoveButton;
