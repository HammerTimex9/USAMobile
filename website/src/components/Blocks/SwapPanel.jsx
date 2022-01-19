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
  const { quoteValid, setQuote, toTokenAmount } = useQuote();
  useEffect(() => {
    setQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, txAmount]);
  const getToTokenAmount = () => {
    if (toTokenAmount && fromToken && toToken) {
      if (toToken && toToken.decimals) {
        return (toTokenAmount / 10 ** toToken.decimals).toFixed(3);
      } else {
        return (toTokenAmount / 10 ** fromToken.decimals).toFixed(3);
      }
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
      {fromToken && toTokenAmount && (
        <Typography className="trade-result">
          1 {fromToken.symbol} ={' '}
          {(
            txAmount /
            10 ** fromToken.decimals /
            (toTokenAmount / 10 ** toToken.decimals)
          ).toFixed(3)}{' '}
          {toToken.symbol}
        </Typography>
      )}
      {quoteValid && <QuotePanel />}
      <RequestQuote />
    </Box>
  );
};
