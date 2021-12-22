import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { Box, Stack, Typography, Modal } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { usePositions } from '../../contexts/portfolioContext';
import { PortfolioSvg, TradeSvg, BuySvg, ArrowsSvg } from '../../assets/icons';

import { Tab } from '../UW/Tab';

export const NavBar = () => {
  const { user } = useMoralis();
  const { positions } = usePositions();
  const [modal, setModal] = useState(false);
  const address = user?.attributes?.ethAddress;
  const emptyPositions = !address || positions.length === 0;
  const isOnlyMatic = positions.length === 1 && positions[0].symbol === 'MATIC';
  useEffect(() => {
    if (user && !address) {
      alert('You should login with Metamask!');
    }
  }, [user]);
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

          '& svg': {
            fontSize: 30,
            marginBottom: '2px',
          },
        }}
      >
        <Link to="/">
          <Tab label="Home">
            <HomeIcon />
          </Tab>
        </Link>
        <Link to="/Portfolio" className={`${emptyPositions ? 'disabled' : ''}`}>
          <Tab label="Portfolio">
            <PortfolioSvg />
          </Tab>
        </Link>
        <Link to="/SwapTrade" className={`${emptyPositions ? 'disabled' : ''}`}>
          <Tab label="Trade">
            <TradeSvg />
          </Tab>
        </Link>
        <Link to="/BuySell">
          <Tab label="Buy Crypto">
            <BuySvg />
          </Tab>
        </Link>

        <Link
          to="/SendRecieve"
          className={`${emptyPositions ? 'disabled' : ''}`}
        >
          <Tab label={isOnlyMatic ? 'Recieve' : 'Send/Recieve'}>
            <ArrowsSvg />
          </Tab>
        </Link>
      </Box>
      <Modal open={modal} onBackdropClick={() => setModal(false)}>
        <Box>
          <Typography>Alert</Typography>
          <Typography>You should login with metamask!</Typography>
        </Box>
      </Modal>
    </Stack>
  );
};
