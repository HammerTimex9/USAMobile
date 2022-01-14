import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { Box, Stack, Typography, Modal } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { usePositions } from '../../contexts/portfolioContext';
import { PortfolioSvg, TradeSvg, BuySvg, ArrowsSvg } from '../../assets/icons';

import { Tab } from '../UW/Tab';

const activeTab = (history, path) => {
  if (history.location.pathname === path) {
    return 'active-usa-wallet-tab';
  }
  return '';
};

export const NavBar = () => {
  const history = useHistory();
  const { user, authenticate, isAuthenticating, logout } = useMoralis();
  const { positions } = usePositions();
  const [modal, setModal] = useState(false);

  const address = user?.attributes?.ethAddress;
  const emptyPositions = false; //!address || positions.length === 0;
  // const isOnlyMatic = positions.length === 1 && positions[0].symbol === 'MATIC';
  const { pathname } = history.location;
  useEffect(() => {
    if (
      user &&
      !address &&
      (pathname === '/Portfolio' || pathname === '/SwapTrade')
    ) {
      if (window.ethereum && !isAuthenticating) {
        authenticate({ usePost: true });
      } else {
        logout();
        history.push('/crypto-login');
      }
    }
    if (
      user &&
      (pathname === '/Portfolio' || pathname === '/SwapTrade') &&
      !window.ethereum
    ) {
      logout();
      history.push('/crypto-login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user, address]);

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
        <Link to="/" className={`${activeTab(history, '/')}`}>
          <Tab label="Home">
            <HomeIcon />
          </Tab>
        </Link>
        <Link
          to="/Portfolio"
          className={`${emptyPositions ? 'disabled' : ''} ${activeTab(
            history,
            '/Portfolio'
          )}`}
        >
          <Tab label="Portfolio">
            <PortfolioSvg />
          </Tab>
        </Link>
        <Link
          to="/SwapTrade"
          className={`${positions.length === 0 ? 'disabled' : ''} ${activeTab(
            history,
            '/SwapTrade'
          )}`}
        >
          <Tab label="Trade">
            <TradeSvg />
          </Tab>
        </Link>
        <Link to="/BuySell" className={`${activeTab(history, '/BuySell')}`}>
          <Tab label="Buy Crypto">
            <BuySvg />
          </Tab>
        </Link>

        <Link
          to="/SendReceive"
          className={`${emptyPositions ? 'disabled' : ''} ${activeTab(
            history,
            '/SendReceive'
          )}`}
        >
          {/*<Tab label={isOnlyMatic ? 'Receive' : 'Send/Receive'}>*/}
          <Tab label="Receive">
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
