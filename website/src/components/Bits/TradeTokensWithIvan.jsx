import { useEffect, useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMoralis } from 'react-moralis';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';
import { useQuote } from '../../contexts/quoteContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const TradeTokens = () => {
  const { fromToken, toToken, txAmount } = useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { isAuthenticated, Moralis, user } = useMoralis();
  const { network } = useNetwork();
  const { toTokenAmount } = useQuote();

  const [buttonText, setButtonText] = useState('Trade Tokens.');
  const [trading, setTrading] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [userAddress, setUserAddress] = useState('');

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

  function getAllowance() {
    if (
      (fromToken?.address !== undefined) &
      (fromToken?.address !== NATIVE_ADDRESS)
    ) {
      setDialog('Checking your token trading allowance...');
      return Moralis.Plugins.oneInch
        .hasAllowance({
          chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
          fromTokenAddress: fromToken.address, // The token you want to swap
          fromAddress: userAddress, // Your wallet address
          amount: txAmount,
        })
        .then((res) => {
          const outputString =
            fromToken.symbol.toUpperCase() +
            ' allowance is ' +
            res / 10 ** fromToken.decimals +
            '.';
          setDialog(outputString);
          setButtonText('Allowance found!');
          console.log('allowance check:', outputString);
          return res;
        })
        .catch((error) => {
          setDialog('Allowance check error: ' + error.message);
          setButtonText('Retry');
          console.log('Allowance check error:', error);
        });
    } else {
      setDialog(`No allowance to check on ${fromToken?.symbol}.`);
      setButtonText('Skip Allowance Check...');
      console.log('Skipping allowance check for token: ', fromToken);
      setAllowance(Infinity);
    }
  }

  const approveInfinity = () => {
    const outputText =
      'Unlocking ' +
      fromToken.symbol.toUppperCase() +
      ' on ' +
      network.name +
      ' to trade. Please sign in MetaMask.';
    setDialog(outputText);
    console.log(outputText);
    setButtonText('Unlocking ' + fromToken.symbol.toUpperCase() + '...');
    return Moralis.Plugins.oneInch
      .approve({
        chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
        tokenAddress: fromToken.address, // The token you want to swap
        fromAddress: userAddress, // Your wallet address
      })
      .then((res) => {
        const replyText =
          fromToken.symbol + ' on ' + network.name + ' unlocked!';
        setDialog(replyText);
        console.log(replyText);
        setButtonText(fromToken.symbol + ' unlocked!');
        return res;
      })
      .catch((error) => {
        setDialog('approveInfinity error: ', error.message);
        setButtonText('Retry');
        console.log('approveInfinity error', error);
      });
  };

  function compareAllowance(allowance) {
    if (fromToken.address & (fromToken.address !== NATIVE_ADDRESS)) {
      const offset = 10 ** fromToken.decimals;
      const allowanceTokens = allowance / offset;
      const txAmountTokens = txAmount / offset;
      const comparison = allowanceTokens < txAmountTokens;
      console.log(
        'allowance: ' +
          allowanceTokens +
          ' ?>= txAmount: ' +
          txAmountTokens +
          ' = ' +
          comparison
      );
      if (comparison) {
        const needMore =
          'On-chain allowance of ' +
          allowanceTokens +
          ' is not enough to trade ' +
          txAmountTokens +
          ' ' +
          fromToken.symbol.toUpperCase() +
          ' with.';
        setDialog(needMore);
        setButtonText('Unlock more...');
        console.log(needMore);
        approveInfinity();
      }
    } else {
      const nativeMessage = 'Native token does not have an allowance lock.';
      setDialog(nativeMessage);
      console.log(nativeMessage);
      setButtonText('No lock...');
    }
  }

  const swap = () => {
    const outputText =
      'Swapping ' +
      txAmount / 10 ** fromToken.decimals +
      ' ' +
      fromToken.symbol.toUppperCase() +
      ' for ~' +
      toTokenAmount / 10 ** toToken.decimals +
      ' on ' +
      network.name +
      '.  Please sign in MetaMask.';
    setDialog(outputText);
    console.log(outputText);
    setButtonText('Swapping...');
    return Moralis.Plugins.oneInch
      .swap({
        chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: fromToken.address, // The token you want to swap
        toTokenAddress: toToken.address, // The token you want to receive
        amount: txAmount,
        fromAddress: userAddress, // Your wallet address
        slippage: 1,
      })
      .then((receipt) => {
        const replyText = 'Trade complete.';
        setDialog(replyText);
        console.log('swap receipt:', receipt);
        setButtonText('Trade Again!');
        return receipt;
      })
      .catch((error) => {
        setDialog('A swap error occured: ', error);
        console.log('swap error:', error);
        setButtonText('Retry.');
      });
  };

  function displaySwapReceipt(receipt) {
    console.log('Swap Transfer 1Inch receipt:', receipt);
  }

  function handleClick() {
    setTrading(true);
    getAllowance()
      .then((allowance) => compareAllowance(allowance))
      .then(() => swap())
      .then((swapReceipt) => displaySwapReceipt(swapReceipt))
      .catch((error) => {
        setDialog('A swap process error occured: ', error);
        setButtonText('Retry');
        console.log('swap process error:', error);
        setTrading(false);
      });
  }

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="allowance" fullWidth>
        <Tooltip title="Execute trade transactions.">
          <span>
            <LoadingButton
              disabled={txAmount <= 0}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={trading}
              onClick={handleClick}
              className={
                allowance < txAmount ? 'quote-button disable' : 'quote-button'
              }
            >
              {buttonText}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
