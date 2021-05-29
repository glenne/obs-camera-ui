import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC } from 'react';
import { useCamSending, useCamState } from './AppState';
import { Camera, CameraPreset } from './CameraTypes';
import { applyCamPreset } from './CamUtil';
import { setPreviewScene } from './OBS';

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
}));
export interface CameraPresetProps {
  cam: Camera;
  preset: CameraPreset;
}
export const CameraPresetButton: FC<CameraPresetProps> = ({ cam, preset }) => {
  const classes = useStyles();
  const [camState] = useCamState();
  const [sending] = useCamSending();
  const selected = camState[cam.name]?.preset.name === preset.name;
  const error = camState[cam.name]?.err;
  const bgclass = selected ? (error ? classes.error : classes.success) : classes.normal;

  const performButtonClick = () => {
    if (preset.obsScene) {
      setPreviewScene(preset.obsScene);
    }
    applyCamPreset(cam, preset);
  };
  return (
    <div className={classes.root}>
      {sending ? (
        <CircularProgress />
      ) : (
        <Button size="small" variant="contained" onClick={performButtonClick} className={bgclass}>
          {preset.name}
        </Button>
      )}
    </div>
  );
};

export default CameraPresetButton;
