import { useEffect, useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMoralis } from 'react-moralis';

import { useActions } from '../../../contexts/actionsContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useColorMode } from '../../../contexts/colorModeContext';
import { useNetwork } from '../../../contexts/networkContext';
import { useQuote } from '../../../contexts/quoteContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const TradeTokensWithIvan = () => {
  const { fromToken, toToken, txAmount } = useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();

  const { isAuthenticated, Moralis, user } = useMoralis();
  const { network } = useNetwork();
  const { toTokenAmount, estimatedGas } = useQuote();

  const [buttonText, setButtonText] = useState('Trade Tokens.');
  const [trading, setTrading] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [mode, setMode] = useState('allowance');

  useEffect(() => {
    if (isAuthenticated) {
      try {
        setUserAddress(user?.attributes['ethAddress']);
      } catch (error) {
        setDialog('Authentication error: ', error.message);
        console.log('TradeTokens authentication error:', error);
      }
    }
  }, [isAuthenticated, setDialog, user?.attributes]);

  useEffect(() => {
    setButtonText(mode === 'allowance' ? 'Check Allowance.' : 'Trade.');
  }, [mode]);

  async function getAllowance() {
    if (fromToken?.token_address === undefined) {
      console.log(
        'Attempted to get allowance from Ivan without a token address.'
      );
      console.log('fromToken:', fromToken);
      setMode('trade');
      return undefined;
    }
    if (fromToken?.token_address === NATIVE_ADDRESS) {
      console.log('Attempted to get allowance from Ivan on a native token.');
      setMode('trade');
      return undefined;
    }
    setDialog('Ivan is checking your token trading allowance...');
    setButtonText('Checking Allowance.');
    const params = {
      chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: fromToken.token_address, // The token you want to swap
      fromAddress: userAddress, // Your wallet address
      amount: txAmount, // No decimals
    };
    console.log('params: ', params);
    return Moralis.Plugins.oneInch
      .hasAllowance(params)
      .then((allowanceReturn) => {
        const outputString =
          'Your ' +
          fromToken.symbol.toUpperCase() +
          ' allowance is ' +
          allowanceReturn +
          '.';
        setDialog(outputString);
        setButtonText('Allowance found.');
        console.log('allowance check:', outputString);
        setMode(allowanceReturn ? 'trade' : 'allowance');
        return allowanceReturn;
      })
      .catch((error) => {
        setDialog('Allowance check error: ', error);
        setButtonText('Retry.');
        console.log('getAllowance error: ', error);
        return undefined;
      });
  }

  async function approveInfinity() {
    const outputText =
      'Unlocking ' +
      fromToken.symbol +
      ' on ' +
      network.name +
      ' to trade. Please sign in MetaMask.';
    setDialog(outputText);
    console.log(outputText);
    setButtonText('Unlocking ' + fromToken.symbol + '.');
    const props = {
      chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
      tokenAddress: fromToken.token_address, // The token you want to swap
      fromAddress: userAddress, // Your wallet address
    };
    console.log('props:', props);
    try {
      await Moralis.Plugins.oneInch.approve(props);
      const replyText = fromToken.symbol + ' on ' + network.name + ' unlocked!';
      setDialog(replyText);
      console.log(replyText);
      setButtonText(fromToken.symbol + ' unlocked!.');
      setMode('trade');
    } catch (error) {
      switch (error.code) {
        case 4001:
          setDialog(
            fromToken.symbol +
              ' trading unlock canceled.  ' +
              'Choose another token to trade or hit Redo Allowance to continue.'
          );
          break;
        default:
          setDialog(
            'A ' +
              error.code +
              ' error occured while unlocking ' +
              fromToken.symbol +
              '.  Hit Redo Allowance to try again.'
          );
      }
      setButtonText('Redo Allowance.');
      setTrading(false);
      console.log('Approveal failed. ', error);
    }
  }

  const swap = () => {
    const outputText =
      'Swapping ' +
      txAmount / 10 ** fromToken.decimals +
      ' ' +
      fromToken?.symbol +
      ' for ~' +
      (toTokenAmount / 10 ** toToken.decimals).toFixed(3) +
      ' ' +
      toToken?.symbol +
      ' on ' +
      network.name +
      '.  Please sign this Tx in MetaMask.';
    setDialog(outputText);
    console.log(outputText);
    console.log('fromToken: ', fromToken);
    console.log('toToken: ', toToken);
    setButtonText('Swapping.');
    const params = {
      chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: fromToken.token_address || NATIVE_ADDRESS, // The token you want to swap
      toTokenAddress: toToken.address || NATIVE_ADDRESS, // The token you want to receive
      amount: txAmount,
      fromAddress: userAddress, // Your wallet address
      slippage: 1,
      gasPrice: 4 * estimatedGas,
      gasLimit: 6 * estimatedGas,
    };
    console.log('swap params:', params);
    return Moralis.Plugins.oneInch
      .swap(params)
      .then((receipt) => {
        const replyText =
          'Burned ' +
          receipt.cumulativeGasUsed +
          ' gas from Matic.  Trade complete!' +
          '  Adjust settings and trade again!';
        setDialog(replyText);
        console.log('swap receipt:', receipt);
        setButtonText('Trade Again!.');
        return receipt;
      })
      .catch((error) => {
        switch (error.code) {
          case 4401:
            setDialog(
              'Transaction canceled in MetaMask.  ' +
                'No funds swapped.  ' +
                'No fees charged.  ' +
                'Adjust trade and try again.'
            );
            setButtonText('Redo trade.');
            console.log('Swap transaction canceled in MetaMask.com.');
            break;
          default:
            setDialog('A swap error occured: ', error);
            console.log('swap error:', error);
            setButtonText('Retry.');
        }
        setTrading(false);
      });
  };

  function displaySwapReceipt(receipt) {
    console.log('Swap Transfer 1Inch receipt:', receipt);
  }

  function handleClick() {
    setTrading(true);
    switch (mode) {
      case 'allowance':
        getAllowance()
          .then((allowance) => {
            allowance ? console.log('Moving on...') : approveInfinity();
          })
          .catch((error) => {
            setDialog('An allowance error occured: ', error);
            setButtonText('Retry.');
            console.log('swap process error:', error);
          });
        break;
      case 'trade':
        swap()
          .then((swapReceipt) => displaySwapReceipt(swapReceipt))
          .catch((error) => {
            setDialog('A swap process error occured: ', error);
            setButtonText('Retry.');
            console.log('swap process error:', error);
          });
        break;
      default:
        setDialog('Unknown mode: ' + mode);
        setButtonText('Retry.');
        console.log('Unknown mode: ', mode);
    }
    setTrading(false);
  }

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="allowance" fullWidth>
        <Tooltip title="Execute trade transactions.">
          <span>
            <LoadingButton
              disabled={false}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={trading}
              onClick={handleClick}
              className={'quote-button'}
            >
              {buttonText}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
