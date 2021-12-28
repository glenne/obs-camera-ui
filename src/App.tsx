import { CircularProgress, CssBaseline, Paper, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { CookiesProvider } from 'react-cookie';
import './App.css';
import { logError, setOBSConfig, useCameraList, useErrorLog } from './AppState';
import { CameraList, CameraPreset, Configuration, OBSConfig } from './CameraTypes';
import CameraView from './CameraView';
import { doOBSTransition, startOBSMonitor, stopOBSMonitor, useOBSConnected } from './OBS';
import useKeypress from 'react-use-keypress';

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
  transition: {
    margin: theme.spacing(1),
  },
}));

const HomeApp = () => {
  const [cameralist, setCameraList] = useCameraList();
  const [cookies, setCookie] = useCookies(['config']);
  const [obsConnected] = useOBSConnected();
  const [errorLog] = useErrorLog();
  const [transitionProgress, setTransitionProgress] = useState(false);
  const classes = useStyles();

  const initiateOBSTransition = () => {
    setTransitionProgress(true);
    doOBSTransition();
    setTimeout(() => setTransitionProgress(false), 1200);
  };
  useKeypress('Enter', initiateOBSTransition);

  useEffect(() => {
    const config = cookies.config;
    logError('App', undefined);
    if (config) {
      try {
        // setOBSConfig(config.obs as OBSConfig);
        // setCameraList(config.cams as CameraList);
      } catch (e) {
        logError('App', 'Error parsing json: ' + e.message);
      }
    }
  }, [cookies, setCameraList]);

  useEffect(() => {
    startOBSMonitor();
    return () => stopOBSMonitor();
  }, []);

  useEffect(() => {
    const getData = () => {
      console.log('requesting json..');
      fetch('../camconfig.json', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          pragma: 'no-cache',
          'cache-control': 'no-cache',
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (config) {
          setOBSConfig(config.obs as OBSConfig);
          setCameraList(config.cams as CameraList);
        })
        .catch((err) => {
          console.log(err.message);
        });
    };
    getData();
  }, [setCameraList]);

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
      const config = JSON.parse(json) as Configuration;
      if (Array.isArray(config.cams)) {
        config.cams.forEach((camConfig)=>{
          if (Array.isArray(camConfig.presets)) {
            camConfig.presets.forEach((camPreset:CameraPreset)=>{
              // Insure all fields are defined
              camPreset.name = camPreset.name || 'Undefined';
              camPreset.preset = camPreset.preset || 0;
              camPreset.obsScene = camPreset.obsScene || '';
              camPreset.hotkey = camPreset.hotkey || '';
              
            });
          } else {
            logError('File read',"Missing config.cams.presets");
          }
      });
      setCookie('config', json, { path: '/' });
      setOBSConfig(config.obs as OBSConfig);
      setCameraList(config.cams as CameraList);
      } else {
        logError('File read',"Missing config.cams");
      }
      
    };
    reader.readAsText(event.target.files[0]);
  };
  return (
    <div className="App">
      {!obsConnected && <Typography color="error">OBS is not connected!</Typography>}
      <Grid container spacing={0}>
        {cameralist.map((cam) => (
          <Grid key={cam.name} item xs={6}>
            <CameraView cam={cam} />
          </Grid>
        ))}
      </Grid>

      {obsConnected &&
        (transitionProgress ? (
          <CircularProgress />
        ) : (
          <Button className={classes.transition} size="small" variant="contained" onClick={initiateOBSTransition}>
            Transition
          </Button>
        ))}
      {errorLog.size ? (
        <Paper className={classes.error} variant="outlined">
          {Array.from(errorLog).map(([tag, msg]) => (
            <Typography key={msg}>{msg}</Typography>
          ))}
        </Paper>
      ) : (
        <Paper />
      )}
      <input style={{ display: 'none' }} id="contained-button-file" type="file" onChange={onFileSelected} />
      <label htmlFor="contained-button-file">
        <Button size="small" variant="contained" style={{ background: '#808080' }} component="span">
          Load Configuration
        </Button>
      </label>
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
