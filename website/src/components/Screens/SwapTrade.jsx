import { useEffect } from 'react';
import { useMoralis } from 'react-moralis';

import { Box } from '@mui/material';

import { SwapPanel } from '../../containers/SwapPanel';
import { Heading } from '../UW/Heading';

import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';
import { usePolygonNetwork } from '../../hooks/usePolygonNetwork';

const SwapTrade = () => {
  const { setExpert, setDialog } = useExperts();
  const { isAuthenticated } = useMoralis();
  const { switchNetworkToPolygon } = usePolygonNetwork();
  const { isPolygon } = useNetwork();

  useEffect(() => {
    if (isAuthenticated) {
      if (!isPolygon) {
        setDialog('Check your MetaMask and Accept Polygon Switch.');
        switchNetworkToPolygon();
      }
    }
    // const address = user?.attributes?.ethAddress;
    // if (!address) {
    //   authenticate({ usePost: true });
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPolygon]);

  useEffect(() => {
    setExpert({
      character: 'mlk',
      dialog: 'Select a token to convert.',
    });
  }, [setExpert]);

  return (
    <Box sx={{ textAlign: 'center', mt: 1 }}>
      <Heading variant="h4">Trade Crypto</Heading>
      <br />
      <SwapPanel />
    </Box>
  );
};

export default SwapTrade;
