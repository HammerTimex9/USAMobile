import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Box, Modal } from '@mui/material';
import { styled } from '@mui/system';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

import { useExperts } from '../../../contexts/expertsContext';
import { useNetwork } from '../../../contexts/networkContext';
import { usePositions } from '../../../contexts/portfolioContext';
import { usePolygonNetwork } from '../../../hooks/usePolygonNetwork';
import { Heading } from '../../UW/Heading';
import Position from './Position';
import TokenCard from '../../Bits/TokenCard';

const HeaderCell = styled('div')({
  display: 'flex',
  span: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
});

const Portfolio = () => {
  const { isAuthenticated, enableWeb3, isWeb3Enabled } = useMoralis();
  const { setCharacter, setDialog } = useExperts();
  const { isPolygon } = useNetwork();
  const { positions } = usePositions();
  const { switchNetworkToPolygon } = usePolygonNetwork();
  const [selectedSymbol, setSelectedSymbol] = React.useState(null);
  const onModalClose = React.useCallback(() => setSelectedSymbol(), []);

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
    <Box sx={{ width: '100%', maxWidth: '450px' }}>
      <Heading variant="h4">Portfolio and Prices</Heading>

      <Box
        sx={{
          mt: 3,
          pl: 2,
          pr: 1,
          display: 'flex',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        <HeaderCell sx={{ width: '50%' }}>
          <span>COIN</span>
        </HeaderCell>
        <HeaderCell sx={{ width: '25%' }}>
          <span>
            PRICE
            <ArrowDropDownIcon />
          </span>
        </HeaderCell>
        <HeaderCell sx={{ width: '25%', justifyContent: 'flex-end' }}>
          <span>
            HOLDINGS
            <ArrowDropDownIcon />
          </span>
        </HeaderCell>
      </Box>

      {positions.map((position) => (
        <Position
          key={position.name}
          position={position}
          onSelect={setSelectedSymbol}
        />
      ))}

      <Modal
        open={!!selectedSymbol}
        sx={{ maxWidth: '56rem', mx: 'auto', my: '3.56rem' }}
        onBackdropClick={onModalClose}
      >
        <TokenCard symbol={selectedSymbol} onClose={onModalClose} />
      </Modal>
    </Box>
  );
};

export default Portfolio;
