import { useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useQuote } from '../../contexts/quoteContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';

const axios = require('axios');

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
    console.log(
      'Estimating rates to swap ' +
        txAmount.toString() +
        ' of ' +
        fromTokenSymbol +
        ' to ' +
        toTokenSymbol +
        '... '
    );
    const params = {
      fromTokenAddress: fromTokenAddress || NATIVE_ADDRESS,
      toTokenAddress: toTokenAddress || NATIVE_ADDRESS,
      fee: REFERRER_FEE,
      amount: txAmount.toString(),
    };
    axios({
      method: 'get',
      url: ENDPOINT,
      baseURL: ONEINCH4_API + '/' + network.id.toString(),
      data: params,
    })
      .then((response) => {
        console.log('RequestQuote::handleClick()::axios(response):', response);
        setFetching(false);
        const now = new Date();
        setQuote(response.data);
        setDialog(
          'Quote valid as of: ' +
            now.toLocaleTimeString('en-US') +
            '.  Press "Do it!" to execute trade.'
        );
      })
      .catch((error) => {
        console.groupCollapsed('RequestQuote::handleClick()::catch(error):');
        setQuote(null);
        setFetching(false);
        if (error.response) {
          setDialog(
            'Bad 1Inch server response. ' + error.response.data.description
          );
          console.log('.params:', params);
          console.log('.data:', error.response.data);
          console.log('.status:', error.response.status);
          console.log('.headers', error.response.headers);
        } else if (error.request) {
          setDialog('Network error.  Try again.');
          console.log('.request:', error.request);
        } else {
          setDialog('Quote request error: ', error.message);
        }
        console.groupEnd();
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
