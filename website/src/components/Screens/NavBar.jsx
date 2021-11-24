import React from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { Button, Stack } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoopIcon from '@mui/icons-material/Loop';
import LinkIcon from '@mui/icons-material/Link';
import MailIcon from '@mui/icons-material/Mail';

import { usePositions } from '../../contexts/portfolioContext';

export const NavBar = () => {
  const { user } = useMoralis();
  const { positions } = usePositions();
  const address = user?.attributes?.ethAddress;
  const emptyPositions = !address || positions.length === 0;
  const isOnlyMatic = positions.length === 1 && positions[0].symbol === 'MATIC';

  return (
    <Stack direction="row" spacing={1} className="NavBar">
      <Link
        to="/PortfolioPrices"
        className={`${emptyPositions ? 'disabled' : ''}`}
      >
        <Button variant="uw" startIcon={<VisibilityIcon />}>
          Portfolio
        </Button>
      </Link>
      <Link to="/SwapTrade" className={`${emptyPositions ? 'disabled' : ''}`}>
        <Button variant="uw" startIcon={<LoopIcon />}>
          Trade
        </Button>
      </Link>
      <Link to="/BuySell">
        <Button variant="uw" startIcon={<LinkIcon />}>
          Buy Crypto
        </Button>
      </Link>

      <Link to="/SendRecieve" className={`${emptyPositions ? 'disabled' : ''}`}>
        <Button variant="uw" startIcon={<MailIcon />}>
          {isOnlyMatic ? 'Recieve' : 'Send/Recieve'}
        </Button>
      </Link>
    </Stack>
  );
};
