import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Box, Modal, Button } from '@mui/material';
import { styled } from '@mui/system';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import tokenList from '../../../data/TokenList.json';
import { useExperts } from '../../../contexts/expertsContext';

import { usePositions } from '../../../contexts/portfolioContext';

import { Heading } from '../../UW/Heading';
import Position from './Position';
import TokenCard from '../../Bits/TokenCard';

// We are commenting below Import, we are not using this to stop multiple request.

// import { useMoralis } from 'react-moralis';
// import { useNetwork } from '../../../contexts/networkContext';
// import { usePolygonNetwork } from '../../../hooks/usePolygonNetwork';

const Toolbar = styled('div')({
  marginTop: 18,
  textAlign: 'right',
  a: {
    color: 'inherit',
    textDecoration: 'none',
  },
  button: {
    padding: '6px 14px',
  },
});

const HeaderCell = styled('div')({
  display: 'flex',
  span: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
});

const Portfolio = () => {
  const { setDialog, setExpert } = useExperts();
  const { totalValue, positions } = usePositions();
  const [selectedSymbol, setSelectedSymbol] = React.useState(null);
  const [hoverdToken, setHoverdToken] = React.useState();
  const onModalClose = React.useCallback(() => setSelectedSymbol(), []);

  /**
   * We are commenting this,
   * because we don't need metamask/Web3 connection on this page
   * If we need in Future we can undo this code
   * and can use according to our logic.
   */

  // const { isAuthenticated, enableWeb3, isWeb3Enabled } = useMoralis();
  // const { isPolygon } = useNetwork();
  // const { switchNetworkToPolygon } = usePolygonNetwork();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (isWeb3Enabled) {
  //       if (!isPolygon) {
  //         setDialog('Check your Metamast and Accept Polygon Switch.');
  //         switchNetworkToPolygon();
  //       }
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isAuthenticated, isPolygon, isWeb3Enabled]);

  useEffect(() => {
    const token = tokenList.find((t) => t.symbol === hoverdToken?.symbol);
    console.log(token);
    setExpert({
      character: 'unclesam',
      dialog:
        token?.shortDescription ||
        'Select a currency to view ' +
          (token ? token.symbol : null) +
          ' transaction histories.',
    });
  }, [hoverdToken, setExpert]);

  useEffect(() => {
    setDialog(
      'Your current portfolio value is $' + totalValue.toFixed(2) + ' USD'
    );
  }, [setDialog, totalValue]);

  return (
    <Box sx={{ width: '100%', maxWidth: '450px' }}>
      <Heading variant="h4">Portfolio and Prices</Heading>

      <Toolbar>
        <Link
          to={{
            pathname: '/SwapTrade',
            state: { fromSymbol: 'MATIC', toSymbol: 'USDC' },
          }}
        >
          <Button px={4}>Trade Matic for USDC</Button>
        </Link>
      </Toolbar>

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
          onMouseEnter={() => setHoverdToken(position)}
          onMouseLeave={() => setHoverdToken()}
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
