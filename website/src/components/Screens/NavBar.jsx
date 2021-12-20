import React from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { Box, Stack } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import HomeIcon from '@mui/icons-material/Home';

import { usePositions } from '../../contexts/portfolioContext';
import { Tab } from '../UW/Tab';

export const NavBar = () => {
  const { user } = useMoralis();
  const { positions } = usePositions();
  const address = user?.attributes?.ethAddress;
  const emptyPositions = !address || positions.length === 0;
  const isOnlyMatic = positions.length === 1 && positions[0].symbol === 'MATIC';

  return (
    <Stack
      spacing={1}
      className="NavBar"
      sx={{ width: '100%', alignItems: 'center', borderTop: 1 }}
    >
      <Box
        component="div"
        sx={{
          display: 'flex',
          width: 450,
          justifyContent: 'space-evenly',
          background: 'var(--tabbar-background)',
          borderRadius: '0 0 30px 30px',
        }}
      >
        <Link to="/">
          <Tab label="Home">
            <HomeIcon />
          </Tab>
        </Link>
        <Link to="/Portfolio" className={`${emptyPositions ? 'disabled' : ''}`}>
          <Tab label="Portfolio">
            <PhotoCamera />
          </Tab>
        </Link>
        <Link to="/SwapTrade" className={`${emptyPositions ? 'disabled' : ''}`}>
          <Tab label="Trade">
            <PhotoCamera />
          </Tab>
        </Link>
        <Link to="/BuySell">
          <Tab label="Buy Crypto">
            <PhotoCamera />
          </Tab>
        </Link>

        <Link
          to="/SendRecieve"
          className={`${emptyPositions ? 'disabled' : ''}`}
        >
          <Tab label={isOnlyMatic ? 'Recieve' : 'Send/Recieve'}>
            <PhotoCamera />
          </Tab>
        </Link>
      </Box>
    </Stack>
  );
};
