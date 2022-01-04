import React, { useState } from 'react';
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
  const { positions } = usePositions();
  const [modal, setModal] = useState(false);
  const emptyPositions = false; //!address || positions.length === 0;
  const isOnlyMatic = positions.length === 1 && positions[0].symbol === 'MATIC';
  // useEffect(() => {
  //   // To Debug User value
  //   // console.log('User:', user);
  //   if (user && !address) {
  //     alert(
  //       'We recommend authenticating with MetaMask as a more secure login than using email and passwords.'
  //     );
  //   }
  // }, [user, address]);
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
          className={`${emptyPositions ? 'disabled' : ''} ${activeTab(
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
          to="/SendRecieve"
          className={`${emptyPositions ? 'disabled' : ''} ${activeTab(
            history,
            '/SendRecieve'
          )}`}
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
