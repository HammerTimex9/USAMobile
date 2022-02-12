import { useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useQuote } from '../../contexts/quoteContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0';
const ENDPOINT = '/quote';
const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

export const RequestQuote = () => {
  const { fromToken, toToken, txAmount } = useActions();
  const { setQuote, quoteValid } = useQuote();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { network } = useNetwork();
  const [fetching, setFetching] = useState(false);

  const handleClick = () => {
    setFetching(true);
    setDialog(
      `Estimating rates to swap ${txAmount / 10 ** fromToken?.decimals} of
       ${fromToken?.symbol} to ${toToken?.symbol} ... `
    );
    const baseURL = ONEINCH4_API + '/' + network.id.toString();
    const url =
      baseURL +
      ENDPOINT +
      '?fromTokenAddress=' +
      (fromToken?.address || NATIVE_ADDRESS) +
      '&toTokenAddress=' +
      (toToken?.address || NATIVE_ADDRESS) +
      '&fee=' +
      REFERRER_FEE.toString() +
      '&amount=' +
      txAmount.toString();

    fetch(url, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        setFetching(false);
        const now = new Date();
        if (response.statusCode === 200) {
          setQuote(response);
          setDialog(
            'Quote valid as of: ' +
              now.toLocaleTimeString('en-US') +
              '.  Press "Do it!" to execute trade.'
          );
        } else {
          throw response;
        }
      })
      .catch((error) => {
        setDialog('A network error occurred: ' + error.error);
        setQuote(null);
        setFetching(false);
        console.log('Quote fetch error: ', error);
      });
  };

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="sendstart" fullWidth>
        <Tooltip title="Preview token transmission.">
          <span>
            <LoadingButton
              disabled={!txAmount || !toToken?.symbol}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={fetching}
              onClick={handleClick}
              className={
                !txAmount || !toToken?.symbol
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
