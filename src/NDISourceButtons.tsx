import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { getNDISource, setNDISource } from './NDISource';

const useStyles = makeStyles((theme) => ({
  transition: {
    alignSelf: 'start',
  },
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    margin: theme.spacing(1),
  },
  groupLabel: {
    marginRight: theme.spacing(0.5),
  },
  active: {
    background: '#388e3c',
    '&:hover': {
      background: '#388e3c',
    },
  },
}));

interface NDIReceiverSource {
  ipAddress: string;
  sourceName: string;
}

interface NDISourceButtonConfig {
  label: string;
  sources: NDIReceiverSource[];
}

interface NDISourceButtonSet {
  prefix: string;
  buttons: NDISourceButtonConfig[];
}

const ndiSourceButtonSets: NDISourceButtonSet[] = [
  {
    prefix: 'Narthex',
    buttons: [
      {
        label: 'OBS',
        sources: [{ ipAddress: '172.20.1.77', sourceName: 'WORSHIPMACMINI.LOCAL (OBS)' }],
      },
      {
        label: 'PPT',
        sources: [{ ipAddress: '172.20.1.77', sourceName: 'NARTHEX2 (Intel UHD Graphics 2)' }],
      },
    ],
  },
  {
    prefix: 'FHall',
    buttons: [
      {
        label: 'OBS',
        sources: [{ ipAddress: '172.20.1.76', sourceName: 'WORSHIPMACMINI.LOCAL (OBS)' }],
      },
      {
        label: 'PPT',
        sources: [{ ipAddress: '172.20.1.76', sourceName: 'NARTHEX2 (Intel UHD Graphics 2)' }],
      },
    ],
  },
  {
    prefix: 'Sanctuary',
    buttons: [
      {
        label: 'EW',
        sources: [
          { ipAddress: '172.20.1.74', sourceName: 'WORSHIP1 (NVIDIA GeForce RTX 3060 Ti 3)' },
          { ipAddress: '172.20.1.75', sourceName: 'WORSHIP1 (NVIDIA GeForce RTX 3060 Ti 3)' },
        ],
      },
      {
        label: 'Alter',
        sources: [
          { ipAddress: '172.20.1.74', sourceName: 'CREWTIMER (,172.20.1.142)' },
          { ipAddress: '172.20.1.75', sourceName: 'CREWTIMER (,172.20.1.142)' },
        ],
      },
      {
        label: 'N Cam',
        sources: [
          { ipAddress: '172.20.1.74', sourceName: 'NORTH PTZ (NDI HX2, 172.20.1.34)' },
          { ipAddress: '172.20.1.75', sourceName: 'NORTH PTZ (NDI HX2, 172.20.1.34)' },
        ],
      },
      {
        label: 'S Cam',
        sources: [
          { ipAddress: '172.20.1.74', sourceName: 'SOUTH PTZ (NDI HX2, 172.20.1.35)' },
          { ipAddress: '172.20.1.75', sourceName: 'SOUTH PTZ (NDI HX2, 172.20.1.35)' },
        ],
      },
    ],
  },
];

const NDISourceButtons: FC = () => {
  const classes = useStyles();
  const [currentSources, setCurrentSources] = useState<Record<string, string>>({});

  const ipAddresses = useMemo(
    () =>
      Array.from(
        new Set(
          ndiSourceButtonSets.reduce<string[]>((addresses, buttonSet) => {
            buttonSet.buttons.forEach((button) => {
              button.sources.forEach(({ ipAddress }) => addresses.push(ipAddress));
            });
            return addresses;
          }, [])
        )
      ),
    []
  );

  const refreshCurrentSources = useCallback(async () => {
    ipAddresses.forEach(async (ipAddress) => {
      try {
        const source = await getNDISource(ipAddress);
        setCurrentSources((previousSources) => ({
          ...previousSources,
          [ipAddress]: source.sourceName,
        }));
      } catch {
        setCurrentSources((previousSources) => {
          const sources = { ...previousSources };
          delete sources[ipAddress];
          return sources;
        });
      }
    });
  }, [ipAddresses]);

  const setSources = async (sources: NDIReceiverSource[]) => {
    await Promise.all(sources.map(({ ipAddress, sourceName }) => setNDISource(ipAddress, sourceName)));
    await refreshCurrentSources();
  };

  const isActive = (sources: NDIReceiverSource[]) => {
    return sources.every(({ ipAddress, sourceName }) => currentSources[ipAddress] === sourceName);
  };

  useEffect(() => {
    refreshCurrentSources();
    const timer = setInterval(refreshCurrentSources, 30000);
    return () => clearInterval(timer);
  }, [refreshCurrentSources]);

  return (
    <>
      {ndiSourceButtonSets.map(({ prefix, buttons }) => (
        <div key={prefix} className={classes.group}>
          <Typography className={classes.groupLabel} variant="body2">
            {prefix}
          </Typography>
          <ButtonGroup size="small" variant="contained">
            {buttons.map(({ label, sources }) => (
              <Button
                key={`${prefix}-${label}`}
                className={`${classes.transition} ${isActive(sources) ? classes.active : ''}`}
                onClick={() => setSources(sources)}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      ))}
    </>
  );
};

export default NDISourceButtons;
