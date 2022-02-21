import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { useActions } from '../../contexts/actionsContext';
import { useQuote } from '../../contexts/quoteContext';

import { FromSelect } from '../../components/Bits/FromSelect';
import { AmountSelect } from '../../components/Bits/AmountSelect';

// Swap mode.
import { ToSelect } from '../../components/Bits/ToSelect';
import { RequestQuote } from '../../components/Bits/RequestQuote';
import { RequestQuoteFromIvan } from '../../components/Bits/RequestQuoteFromIvan';
import { QuotePanel } from '../QuotePanel';
import YouWillGet from '../../components/Bits/Youwillget';

export const SwapPanel = () => {
  const { fromToken, txAmount, toToken } = useActions();
  const { quoteValid, setQuote, toTokenAmount } = useQuote();
  const useIvan = false;

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
            toTokenAmount /
            10 ** toToken.decimals /
            (txAmount / 10 ** fromToken.decimals)
          ).toFixed(3)}{' '}
          {toToken.symbol}
        </Typography>
      )}
      {quoteValid && <QuotePanel />}
      {useIvan ? <RequestQuoteFromIvan /> : <RequestQuote />}
    </Box>
  );
};
