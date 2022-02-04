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
  const { network } = useNetwork();
  const [fetching, setFetching] = useState(false);

  const handleClick = () => {
    setFetching(true);
    setDialog(
      `Estimating rates to swap ${txAmount} of ${fromTokenSymbol} to ${toTokenSymbol} ... `
    );
    const baseURL = ONEINCH4_API + '/' + network.id.toString();
    const url =
      baseURL +
      ENDPOINT +
      '?fromTokenAddress=' +
      (fromTokenAddress || NATIVE_ADDRESS) +
      '&toTokenAddress=' +
      (toTokenAddress || NATIVE_ADDRESS) +
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
        console.groupCollapsed('RequestQuote::handleClick()::fetch(response):');
        console.log('response:', response);
        console.groupEnd();
        setFetching(false);
        const now = new Date();
        setQuote(response);
        setDialog(
          'Quote valid as of: ' +
            now.toLocaleTimeString('en-US') +
            '.  Press "Do it!" to execute trade.'
        );
      })
      .catch((error) => {
        console.groupCollapsed('RequestQuote::handleClick()::catch(error):');
        console.log('Error:', error);
        console.groupEnd();
        setQuote(null);
        setFetching(false);
      });
  };

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="sendstart" fullWidth>
        <Tooltip title="Preview token transmission.">
          <span>
            <LoadingButton
              disabled={!txAmount || !toTokenSymbol}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={fetching}
              onClick={handleClick}
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
