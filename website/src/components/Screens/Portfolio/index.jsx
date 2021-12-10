import { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Box } from '@mui/material';

import { useExperts } from '../../../contexts/expertsContext';
import { useNetwork } from '../../../contexts/networkContext';
import { usePolygonNetwork } from '../../../hooks/usePolygonNetwork';
import { Heading } from '../../UW/Heading';
import { TokenTable } from './TokenTable';

const Portfolio = () => {
  const { setCharacter, setDialog } = useExperts();

  const { isAuthenticated, enableWeb3, isWeb3Enabled } = useMoralis();
  const { isPolygon } = useNetwork();
  const { switchNetworkToPolygon } = usePolygonNetwork();

  useEffect(() => {
    if (isAuthenticated) {
      if (!isWeb3Enabled) {
        enableWeb3();
      } else {
        if (!isPolygon) {
          setDialog('Check your Metamast and Accept Polygon Switch.');
          switchNetworkToPolygon();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPolygon, isWeb3Enabled, enableWeb3]);

  useEffect(() => {
    setCharacter('unclesam');
    setDialog('Select a currency to view transaction histories.');
  }, [setCharacter, setDialog]);

  return (
    <Box>
      <Heading variant="h4">Portfolio and Prices</Heading>
      <br />
      <TokenTable />
    </Box>
  );
};

export default Portfolio;
