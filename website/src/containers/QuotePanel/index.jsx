import React from 'react';
import { Stack } from '@mui/material';
import { TradeTokens } from '../../components/Bits/TradeTokens';

export const QuotePanel = () => {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: '3px',
        px: 10,
        py: 2,
      }}
      style={{ paddingRight: 0, paddingLeft: 0 }}
      spacing={2}
    >
      <Stack direction="row">
        <TradeTokens />
      </Stack>
    </Stack>
  );
};
