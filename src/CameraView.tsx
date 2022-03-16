import { Divider, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC } from 'react';
import { useLastCamSelected } from './AppState';
import CameraPresetButton from './CameraPresetButton';
import { Camera } from './CameraTypes';
import clsx from 'clsx';
import CameraMoveButton from './CameraMoveButton';

const liveColor='#00ff00';
const liveDimColor='#003000';
const idleColor='#ff0000';
const idleDimColor='#300000';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(0),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    margin: theme.spacing(1),
    borderColor: 'red',
    backgroundColor: '#300000',
  },
  selectablePaper: {
    borderColor: '#00ff00',
    backgroundColor: '#003000',
  },
  selectableTitle: {
    color: '#00ff00',
  },
  nonselectableTitle: {
    color: '#ff0000',
  },
  selectableDivider: {
    backgroundColor: '#00ff00',
  },
  nonselectableDivider: {
    backgroundColor: '#ff0000',
  },
}));
export interface CameraProps {
  cam: Camera;
}
export const CameraView: FC<CameraProps> = ({ cam }) => {
  const classes = useStyles();
  const [lastCamSelected] = useLastCamSelected();
  const selectable = cam.name !== lastCamSelected;
  const realCam = Boolean(cam.ip);
  return (
    <Paper variant="outlined" className={clsx(classes.paper, selectable && classes.selectablePaper)} >
      <Typography className={selectable ? classes.selectableTitle : classes.nonselectableTitle} variant="h5">
        {cam.name}
      </Typography>
      {realCam &&
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div>
            <CameraMoveButton cam={cam} direction="Left" dim={!selectable} />
            <CameraMoveButton cam={cam} direction="Right" dim={!selectable} /></div>
          <div> <CameraMoveButton cam={cam} direction="ZoomWide" dim={!selectable} />
            <CameraMoveButton cam={cam} direction="ZoomTele" dim={!selectable} />

          </div><div><CameraMoveButton cam={cam} direction="Up" dim={!selectable} />
            <CameraMoveButton cam={cam} direction="Down" dim={!selectable} /></div>
        </div >
      }
      <Divider className={selectable ? classes.selectableDivider : classes.nonselectableDivider} />
      {
        cam.presets.map((preset) => (
          <CameraPresetButton key={preset.name} cam={cam} preset={preset} dim={!selectable} />
        ))
      }
    </Paper >
  );
};

export default CameraView;
