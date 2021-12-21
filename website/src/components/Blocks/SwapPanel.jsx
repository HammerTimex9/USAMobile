import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { useActions } from '../../contexts/actionsContext';
import { useQuote } from '../../contexts/quoteContext';

import { FromSelect } from '../Bits/FromSelect';
import { AmountSelect } from '../Bits/AmountSelect';

// Swap mode.
import { ToSelect } from '../Bits/ToSelect';
import { RequestQuote } from '../Bits/RequestQuote';
import { QuotePanel } from '../Scrapbox/QuotePanel';
import YouWillGet from '../Bits/Youwillget';

export const SwapPanel = () => {
  const { fromToken, txAmount, toToken } = useActions();
  const { quoteValid, setQuote } = useQuote();
  useEffect(() => {
    setQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, txAmount]);
  const getAmount = () => {
    let decimals = 18;
    if (fromToken && fromToken.decimals) {
      return (txAmount / 10 ** fromToken.decimals).toFixed(3);
    } else {
      return (txAmount / 10 ** decimals).toFixed(3);
    }
  };
  const getToTokenAmount = () => {
    if (toToken && toToken.price) {
      return (
        ((txAmount / 10 ** fromToken.decimals) * fromToken.price) /
        toToken.price
      ).toFixed(3);
    } else {
      return 0;
    }
  };
  return (
    <Box>
      <Box className="select-amount">
        <FromSelect />
        <AmountSelect />
      </Box>
      <Box className="select-amount">
        <ToSelect />
        <YouWillGet value={getToTokenAmount()} />
      </Box>
      {fromToken && toToken && (
        <Typography className="trade-result">
          {getAmount()} {fromToken.symbol} = {getToTokenAmount()}{' '}
          {toToken.symbol}
        </Typography>
      )}
      {quoteValid && <QuotePanel />}
      <RequestQuote />
    </Box>
  );
};
