import React from 'react';
import { Avatar, Box, Collapse } from '@mui/material';
import { styled } from '@mui/system';

import { TransactionList } from './TransactionList';

const Cell = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '100%',
  cursor: 'pointer',
});

const Position = ({ position, onSelect }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Box
      sx={{
        my: '10px',
        backgroundColor: 'var(--fade-out-bg)',
        boxShadow: 'var(--box-shadow-outset)',
        borderRadius: '10px',
      }}
    >
      <Box
        sx={{
          height: 50,
          px: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Avatar
          sx={{
            width: '35px',
            height: '35px',
            mr: 2,
            background: 'var(--color-white)',
            cursor: 'pointer',
          }}
          name={position.symbol}
          src={
            position.symbol === 'MANA'
              ? 'https://s2.coinmarketcap.com/static/img/coins/64x64/1966.png'
              : position.image
          }
          onClick={() => onSelect(position.symbol)}
        />
        <Cell sx={{ flex: 1 }} onClick={() => onSelect(position.symbol)}>
          {position.symbol}
        </Cell>
        <Cell sx={{ width: '25%' }} onClick={() => onSelect(position.symbol)}>
          ${position.price.toFixed(2)}
        </Cell>
        <Cell
          sx={{
            width: '25%',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <span>${position.value.toFixed(2)}</span>
          <span style={{ color: '#9d9d9f', fontSize: '10px' }}>
            {position.tokens.toPrecision(3)}
            {position.symbol}
          </span>
        </Cell>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <TransactionList
          tokenAddress={position.token_address}
          tokenSymbol={position.symbol.toLowerCase()}
          decimals={position.decimals}
        />
      </Collapse>
    </Box>
  );
};

// We have one unconfirmed Color here on this Page.
export default Position;
