import React from 'react';
import { Box, Grid, Modal, Typography } from '@mui/material';

import tokenList from '../../../data/TokenList.json';
import { usePositions } from '../../../contexts/portfolioContext';
import { Heading } from '../../UW/Heading';
import TokenCard from '../../Bits/TokenCard';

const TokenList = () => {
  const [selectedSymbol, setSelectedSymbol] = React.useState(null);
  const [description, setDescription] = React.useState(null);
  const { positions } = usePositions();

  const onCloseModal = () => setSelectedSymbol();

  return (
    <>
      <Heading variant="h4">Tokens</Heading>

      <Box mt={2}>
        <Grid container spacing={2}>
          {tokenList.map((token, i) => {
            const position = positions.find((p) => p.symbol === token.symbol);
            return (
              <Grid key={token.token_id} item xs={12} sm={6} md={4} lg={3}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    borderRadius: '25px',
                    boxShadow: `4px 6px 10px rgba(0, 0, 0, 0.25)${
                      position ? ', 0 0 0px 4px #efcc61' : ''
                    }`,
                    overflow: 'hidden',

                    '& p': {
                      position: 'absolute',
                      color: '#fff',
                      lineHeight: 1,
                    },
                  }}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/images/tokens/${token.symbol}.png`}
                    width="100%"
                    alt=""
                    loading="lazy"
                  />
                  <Typography sx={{ top: 18, left: 16, fontSize: 20 }}>
                    {token.name}
                  </Typography>
                  <Typography sx={{ top: 21, right: 18 }}>
                    {token.symbol}
                  </Typography>
                  <Typography sx={{ bottom: 18, left: 18, fontSize: 14 }}>
                    {position?.tokens.toPrecision(3)} {position?.symbol}
                  </Typography>
                  <Typography
                    sx={{
                      bottom: 20,
                      right: 18,
                      fontSize: 14,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedSymbol(token.symbol);
                      setDescription(token.description);
                    }}
                  >
                    Read more
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* <Box
        sx={{
          width: 500,
          mx: 'auto',
          borderRadius: '1.5rem',
          backgroundImage: 'var(--bg)',
          border: '4px solid var(--borderColor)',
          overflow: 'hidden',
        }}
      >
        <List
          sx={{
            maxHeight: 288,
            overflow: 'auto',
          }}
          className="uw-scrollbar"
        >
          {tokenList.map((token) => (
            <ListItemButton
              key={token.symbol}
              onClick={() => {
                setSelectedSymbol(token.symbol);
                setDescription(token.description);
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={token.image}
                  size="sm"
                  sx={{ backgroundColor: '#fff' }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={token.name}
                secondary={token.description}
              />
            </ListItemButton>
          ))}
        </List>
      </Box> */}
      <Modal
        open={!!selectedSymbol}
        sx={{ maxWidth: '56rem', mx: 'auto', my: '3.56rem' }}
        onBackdropClick={onCloseModal}
      >
        <TokenCard
          description={description}
          symbol={selectedSymbol}
          onClose={onCloseModal}
        />
      </Modal>
    </>
  );
};

export default TokenList;
