import { CssBaseline, Paper, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { CookiesProvider } from 'react-cookie';
import './App.css';
import { setOBSConfig, useCameraList, useErrorLog } from './AppState';
import { CameraList, OBSConfig } from './CameraTypes';
import CameraView from './CameraView';
import { startOBSMonitor, stopOBSMonitor, useOBSConnected } from './OBS';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const useStyles = makeStyles((theme) => ({
  error: {
    margin: theme.spacing(2),
    padding: theme.spacing(1),
    borderColor: 'red',
  },
}));

const HomeApp = () => {
  const [cameralist, setCameraList] = useCameraList();
  const [cookies, setCookie] = useCookies(['config']);
  const [obsConnected] = useOBSConnected();
  const [errorLog] = useErrorLog();
  const classes = useStyles();

  useEffect(() => {
    const config = cookies.config;

    if (config) {
      try {
        setOBSConfig(config.obs as OBSConfig);
        setCameraList(config.cams as CameraList);
      } catch (e) {
        console.log('Error parsing json: ' + e.message);
      }
    }
  }, [cookies, setCameraList]);

  useEffect(() => {
    startOBSMonitor();
    return () => stopOBSMonitor();
  }, []);

  // useEffect(() => {
  //   getData('./config.json');
  // }, []);

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = (event: any) => {
    if (event.target.files.length === 0) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const json = event.target.result;
      const config = JSON.parse(json);
      setCookie('config', json, { path: '/' });
      setCameraList(config.cams as CameraList);
    };
    reader.readAsText(event.target.files[0]);
  };
  return (
    <div className="App">
      {!obsConnected && <Typography color="error">OBS is not connected!</Typography>}
      <Grid container spacing={0}>
        {cameralist.map((cam) => (
          <Grid item xs={6} key={cam.name}>
            <CameraView cam={cam} />
          </Grid>
        ))}
      </Grid>
      <input style={{ display: 'none' }} id="contained-button-file" type="file" onChange={onFileSelected} />
      <label htmlFor="contained-button-file">
        <Button size="small" variant="contained" style={{ background: '#808080' }} component="span">
          Load Configuration
        </Button>
      </label>
      {errorLog && (
        <Paper className={classes.error} variant="outlined">
          <Typography>{errorLog}</Typography>
        </Paper>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <CookiesProvider>
        <HomeApp />
      </CookiesProvider>
    </ThemeProvider>
  );
};

export default App;
