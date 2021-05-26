import { Divider, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC } from 'react';
import { useLastCamSelected } from './AppState';
import CameraPresetButton from './CameraPresetButton';
import { Camera } from './CameraTypes';
import clsx from 'clsx';

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
  },
  selectablePaper: {
    borderColor: '#00ff00',
  },
  selectableTitle: {
    color: '#00ff00',
  },
  nonselectableTitle: {
    color: '#ff0000',
  },
  selectableDivider: {
    backgroundColor: '#00ff00',
    background: '#00ff00',
    color: '#00ff00',
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
  return (
    <Paper variant="outlined" className={clsx(classes.paper, selectable && classes.selectablePaper)}>
      <Typography className={selectable ? classes.selectableTitle : classes.nonselectableTitle} variant="h5">
        {cam.name}
      </Typography>
      <Divider />
      {cam.presets.map((preset) => (
        <CameraPresetButton key={preset.name} cam={cam} preset={preset} />
      ))}
    </Paper>
  );
};

export default CameraView;
