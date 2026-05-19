import { CssBaseline, Paper, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import React, { useEffect} from 'react';
import { useCookies } from 'react-cookie';
import { CookiesProvider } from 'react-cookie';
import './App.css';
import { logError, setOBSConfig, useCameraList, useErrorLog } from './AppState';
import { CameraList, OBSConfig } from './CameraTypes';
import CameraView from './CameraView';
import { startOBSMonitor, stopOBSMonitor, useOBSConnected } from './OBS';
import NDISourceButtons from './NDISourceButtons';

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
  const [cookies] = useCookies(['config']);
  const [obsConnected] = useOBSConnected();
  const [errorLog] = useErrorLog();
  const classes = useStyles();

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

  return (
    <div className="App" style = { {
      transform: `scale(0.8)` ,transformOrigin: 'top center'
  }}>
      {!obsConnected && <Typography color="error">OBS is not connected!</Typography>}
      <Grid container spacing={0}>
        {cameralist.map((cam) => (
          <Grid key={cam.name} item >
            <CameraView cam={cam} />
          </Grid>
        ))}
      </Grid>
      {/* <TransitionButton/> */}
      <NDISourceButtons />
      
      {errorLog.size ? (
        <Paper className={classes.error} variant="outlined">
          {Array.from(errorLog).map(([tag, msg]) => (
            <Typography key={msg}>{msg}</Typography>
          ))}
        </Paper>
      ) : (
        <Paper />
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
