import { useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMoralis } from 'react-moralis';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useQuote } from '../../contexts/quoteContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const RequestQuoteFromIvan = () => {
  const { Moralis } = useMoralis();
  const { fromToken, toToken, txAmount } = useActions();
  const { setQuote, quoteValid } = useQuote();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { network } = useNetwork();
  const [fetching, setFetching] = useState(false);

  const handleClick = () => {
    setFetching(true);
    const noticeString = `Estimating rates to swap ${
      txAmount / 10 ** fromToken?.decimals
    } of
    ${fromToken?.symbol} to ${toToken?.symbol} ... `;
    setDialog(noticeString);
    // console.log('fromToken: ', fromToken);
    const params = {
      chain: network?.name, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: fromToken?.token_address || NATIVE_ADDRESS, // The token you want to swap
      toTokenAddress: toToken?.address || NATIVE_ADDRESS, // The token you want to receive
      amount: txAmount?.toString(), // Don't forget in raw tokens, don't divide decimals out.
    };
    // console.log('RequestQuoteFromIvan::handleClick() params: ', params);
    Moralis.Plugins.oneInch
      .quote(params)
      .then((response) => {
        // console.log("Ivan's quote response: ", response);
        setQuote(response);
        const now = new Date();
        setDialog(
          'Quote valid as of: ' +
            now.toLocaleTimeString('en-US') +
            '.  Press the trading button to execute this trade.'
        );
        setFetching(false);
      })
      .catch((error) => {
        console.log('Moralis quote fetch error: ', error);
        setQuote(null);
        setDialog('A Moralis error occurred: ' + error.error);
        setFetching(false);
      });
  };

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="sendstart" fullWidth>
        <Tooltip title="Preview transaction results.">
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
