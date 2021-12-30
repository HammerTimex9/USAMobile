import React from 'react';
import { Box, Grid, Modal, Typography } from '@mui/material';
import { styled } from '@mui/system';

import tokenList from '../../../data/TokenList.json';
import { useExperts } from '../../../contexts/expertsContext';
import { usePositions } from '../../../contexts/portfolioContext';
import { useNetwork } from '../../../contexts/networkContext';
import { Heading } from '../../UW/Heading';
import TokenCard from '../../Bits/TokenCard';

const Card = styled(Box)(({ isPosition }) => ({
  borderRadius: '25px',
  boxShadow: isPosition
    ? '0 0 0px 4px #efcc61, 6px 8px 10px rgba(0, 0, 0, 0.3)'
    : '4px 6px 10px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',

  '& > div': {
    position: 'relative',
    display: 'flex',
    cursor: 'pointer',

    '& p': {
      position: 'absolute',
      color: '#fff',
      lineHeight: 1,

      '&.name': {
        top: 18,
        left: 16,
        fontSize: 20,
      },

      '&.symbol': {
        top: 21,
        right: 18,
      },

      '&.value': {
        bottom: 18,
        left: 18,
        fontSize: 14,
      },

      '&.read-more': {
        bottom: 20,
        right: 18,
        fontSize: 14,
        textDecoration: 'underline',
      },
    },
  },
}));

const TokenList = () => {
  const [selectedToken, setSelectedToken] = React.useState();
  const [hoverdToken, setHoverdToken] = React.useState();
  const { positions } = usePositions();
  const { setDialog } = useExperts();
  const { isPolygon } = useNetwork();

  const onCloseModal = () => setSelectedToken();

  React.useEffect(() => {
    if (isPolygon) {
      setDialog(
        hoverdToken?.shortDescription ||
          "Welcome to cryptocurrency, Citizen! Here are today's offerings."
      );
    } else {
      setDialog(
        'Press the infinity button above to install Polygon on MetaMask for deeply discounted trading fees!'
      );
    }
  }, [hoverdToken, setDialog]);

  return (
    <>
      <Heading variant="h4">Tokens</Heading>

      <Box mt={2} sx={{ height: 'calc(100vh - 530px)', overflow: 'auto' }}>
        <Grid container spacing={2} p={1}>
          {tokenList.map((token, i) => {
            const position = positions.find((p) => p.symbol === token.symbol);
            return (
              <Grid key={`${token.token_id}_${i}`} item xs={12} sm={6} md={4}>
                <Card isPosition={!!position}>
                  <Box
                    onClick={() => setSelectedToken(token)}
                    onMouseEnter={() => setHoverdToken(token)}
                    onMouseLeave={() => setHoverdToken()}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL}/images/tokens/${token.symbol}.png`}
                      width="100%"
                      alt=""
                      loading="lazy"
                    />
                    <Typography className="name">{token.name}</Typography>
                    <Typography className="symbol">{token.symbol}</Typography>
                    <Typography className="value">
                      {position?.tokens.toPrecision(3)} {position?.symbol}
                    </Typography>
                    <Typography className="read-more">Read more</Typography>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Modal
        open={!!selectedToken}
        sx={{ maxWidth: '56rem', mx: 'auto', my: '3.56rem' }}
        onBackdropClick={onCloseModal}
      >
        <TokenCard symbol={selectedToken?.symbol} onClose={onCloseModal} />
      </Modal>
    </>
  );
};

export default TokenList;
