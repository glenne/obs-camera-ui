import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC, useEffect, useRef } from 'react';
import { useCamSending, useCamState, useCurrentLiveScene, useCurrentPreviewScene } from './AppState';
import { Camera, CameraPreset } from './CameraTypes';
import { doOBSTransition, setPreviewScene } from './OBS';
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
  const [currentPreviewScene] = useCurrentPreviewScene();
  const [currentLiveScene] = useCurrentLiveScene();
  const clickTimer = useRef<NodeJS.Timeout|undefined>(undefined);
  const selected = preset.obsScene === currentLiveScene.scene.obsScene && preset.preset === currentLiveScene.scene.preset;// camState[cam.name]?.preset.name === preset.name;
  const preview = preset.obsScene === currentPreviewScene.scene.obsScene && preset.preset === currentPreviewScene.scene.preset;
  const error = camState[cam.name]?.err;
  const bgclass = preview ? classes.preview : selected ? (error ? classes.error : classes.success) : classes.normal;

  // console.log(
  //   JSON.stringify({ preview, bgclass, camPreviewScene, name: cam.name, obsScene: camState[cam.name]?.preset.obsScene })
  // );
  const hotkey = preset.hotkey === undefined ? '' : preset.hotkey;
  const keylist: string[] = Array.isArray(hotkey) ? hotkey : [hotkey];

  const performButtonClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current=undefined;
      onSingleClick();
      onDoubleClick();
    } else {
      clickTimer.current = setTimeout(()=>{
        clickTimer.current = undefined;
        onSingleClick();
      },300);
    }
  };

  const onSingleClick = () => {
    if (preset.obsScene) {
      setPreviewScene(preset.obsScene);
    }
  };
  
  const onDoubleClick = () => {
    if (preset.obsScene) {
      doOBSTransition();
    }
  };
  
  useEffect(()=>{
    return ()=>{if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current=undefined;
      }
    }
  },[]);

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
