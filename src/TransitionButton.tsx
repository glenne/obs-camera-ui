import { CircularProgress, Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles";
import { doOBSTransition, useOBSConnected } from './OBS';
import useKeypress from 'react-use-keypress';
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
    transition: {
      margin: theme.spacing(1),
      alignSelf: 'start'
    },
  }));
const TransitionButton = () => {
    const [obsConnected] = useOBSConnected();
  const classes = useStyles();
  const [transitionProgress, setTransitionProgress] = useState(false);

  const initiateOBSTransition = () => {
    setTransitionProgress(true);
    doOBSTransition();
    setTimeout(() => setTransitionProgress(false), 1200);
  };
  useKeypress('Enter', initiateOBSTransition);
  
    return obsConnected ?
        (transitionProgress ? (
          <CircularProgress />
        ) : (
          <Button className={classes.transition} size="small" variant="contained" onClick={initiateOBSTransition}>
            Transition
          </Button>
        )) :null;
}

export default TransitionButton;