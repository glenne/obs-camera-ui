import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC } from 'react';
import { useCamSending, useCamState, useOBSPreviewScene } from './AppState';
import { Camera, CameraPreset } from './CameraTypes';
import { applyCamPreset } from './CamUtil';
import { setPreviewScene } from './OBS';
import useKeypress from 'react-use-keypress';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(),
    height: 24 + theme.spacing() * 2,
  },
  normal: {},
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
  preview: {
    background: '#d0d000',
    '&:hover': {
      background: '#d0d000',
    },
  },
}));
export interface CameraPresetProps {
  cam: Camera;
  preset: CameraPreset;
}
export const CameraPresetButton: FC<CameraPresetProps> = ({ cam, preset }) => {
  const classes = useStyles();
  const [camState] = useCamState();
  const [sending] = useCamSending();
  const [camPreviewScene] = useOBSPreviewScene();
  const selected = camState[cam.name]?.preset.name === preset.name;
  const preview = camPreviewScene && preset.obsScene === camPreviewScene;
  const error = camState[cam.name]?.err;
  const bgclass = preview ? classes.preview : selected ? (error ? classes.error : classes.success) : classes.normal;

  console.log(
    JSON.stringify({ preview, bgclass, camPreviewScene, name: cam.name, obsScene: camState[cam.name]?.preset.obsScene })
  );
  const hotkey = preset.hotkey === undefined ? '' : preset.hotkey;
  const keylist: string[] = Array.isArray(hotkey) ? hotkey : [hotkey];

  const performButtonClick = () => {
    if (preset.obsScene) {
      setPreviewScene(preset.obsScene);
    }
    applyCamPreset(cam, preset);
  };

  useKeypress(keylist, () => {
    performButtonClick();
  });

  return (
    <div className={classes.root}>
      {sending ? (
        <CircularProgress />
      ) : (
        <Button variant="contained" onClick={performButtonClick} className={bgclass}>
          {preset.name}
        </Button>
      )}
    </div>
  );
};

export default CameraPresetButton;
