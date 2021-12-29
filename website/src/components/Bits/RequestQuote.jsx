import { useEffect } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useQuote } from '../../contexts/quoteContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';
import useQuoteAction from '../../actions/useQuoteAction';

export const RequestQuote = () => {
  const { network } = useNetwork();
  const {
    fromTokenSymbol,
    fromTokenAddress,
    toTokenSymbol,
    toTokenAddress,
    txAmount,
  } = useActions();
  const { setQuote, quoteValid } = useQuote();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { fetch, isFetching, data, error } = useQuoteAction({
    chain: network.name,
    fromTokenAddress,
    toTokenAddress,
    amount: txAmount,
  });

  useEffect(() => {
    if (isFetching) {
      setDialog(
        `Estimating costs to swap ${fromTokenSymbol} to ${toTokenSymbol} ... `
      );
    }
  }, [isFetching, fromTokenSymbol, toTokenSymbol, setDialog]);

  useEffect(() => {
    if (data && !data.error) {
      setQuote(data);
      setDialog(
        "Push 'Do it!' to execute trade.  Or adjust inputs to update quote."
      );
    }
  }, [data, setQuote, setDialog]);

  useEffect(() => {
    if (error) {
      setDialog('Something went wrong: ' + error.message);
    }
  }, [error, setDialog]);
  console.log('++ error', error);
  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="sendstart" fullWidth>
        <Tooltip title="Preview token transmission.">
          <span>
            <LoadingButton
              disabled={!txAmount || !toTokenSymbol}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={isFetching}
              onClick={fetch}
              className={
                !txAmount || !toTokenSymbol
                  ? 'quote-button disable'
                  : 'quote-button'
              }
            >
              {quoteValid ? 'Refresh Swap Quote' : 'GET QUOTE'}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
