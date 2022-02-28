import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC, useEffect, useRef } from 'react';
import { useCamState, useCurrentLiveScene, useCurrentPreviewScene, useLastCamSelected } from './AppState';
import { Camera, CameraPreset } from './CameraTypes';
import { doOBSTransition, setPreviewScene } from './OBS';
import useKeypress from 'react-use-keypress';
import { applyCamPreset } from './CamUtil';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(),
    height: 24 + theme.spacing() * 2,
  },
  normal: {
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
export interface CameraPresetProps {
  cam: Camera;
  preset: CameraPreset;
  dim?:boolean;
}
export const CameraPresetButton: FC<CameraPresetProps> = ({ cam, preset, dim }) => {
  const classes = useStyles();
  const [camState] = useCamState();
  const [currentPreviewScene] = useCurrentPreviewScene();
  const [currentLiveScene] = useCurrentLiveScene();
  const clickTimer = useRef<NodeJS.Timeout|undefined>(undefined);
  const [lastCamSelected] = useLastCamSelected();
  const camIsLive = cam.name === lastCamSelected;
  const selected = preset.obsScene === currentLiveScene.scene.obsScene && preset.preset === currentLiveScene.scene.preset;// camState[cam.name]?.preset.name === preset.name;
  const preview = preset.obsScene === currentPreviewScene.scene.obsScene && preset.preset === currentPreviewScene.scene.preset;
  const error = camState[cam.name]?.err;
  const bgclass = preview ? classes.preview : selected ? (error ? classes.error : classes.success) : dim ?  classes.dim :classes.normal;
  const activeCamPreset = camIsLive? currentLiveScene.scene.preset===preset.preset:
                                      camState[cam.name]?.preset.preset === preset.preset;
  // console.log(
  //   JSON.stringify({ preview, bgclass, camPreviewScene, name: cam.name, obsScene: camState[cam.name]?.preset.obsScene })
  // );
  const hotkey = preset.hotkey === undefined ? '' : preset.hotkey;
  const keylist: string[] = Array.isArray(hotkey) ? hotkey : [hotkey];

  const performButtonClick = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const rightClick= e?.type === 'contextmenu';
    if (rightClick) {

    }
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
    } else if (preset.preset >0) {
      applyCamPreset(cam, preset);
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
    onSingleClick();
  });

  return (
    <div className={classes.root}>
      <Button variant="contained" onClick={performButtonClick} className={bgclass} >
          {preset.name}{preset.hotkey?`(${preset.hotkey})`:''}{activeCamPreset && ' <='}
        </Button>
    </div>
  );
};

export default CameraPresetButton;
