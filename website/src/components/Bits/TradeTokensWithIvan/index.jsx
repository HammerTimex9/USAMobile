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
const REFERRER_ADDRESS = process.env.REACT_APP_ONEINCH_REFERRER_ADDRESS;
const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

export const TradeTokensWithIvan = () => {
  const { fromToken, toToken, txAmount } = useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();

  const { isAuthenticated, Moralis, user } = useMoralis();
  const { network } = useNetwork();
  const { toTokenAmount, estimatedGas } = useQuote();

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

  async function getAllowance() {
    if (fromToken?.token_address === undefined) {
      console.log('Attempted to get allowance without a token address.');
      return undefined;
    }
    if (fromToken?.token_address === NATIVE_ADDRESS) {
      console.log('Attempted to get allowance on a native token.');
      return undefined;
    }
    setDialog('Checking your token trading allowance...');
    setButtonText('Checking Allowance...');
    try {
      const allowanceReturn = await Moralis.Plugins.oneInch.hasAllowance({
        chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: fromToken.token_address, // The token you want to swap
        fromAddress: userAddress, // Your wallet address
        amount: txAmount, // No decimals
      });
      const outputString =
        fromToken.symbol.toUpperCase() +
        ' allowance is ' +
        allowanceReturn / 10 ** fromToken.decimals +
        '.';
      setDialog(outputString);
      setButtonText('Allowance found!');
      console.log('allowance check:', outputString);
      setAllowance(allowanceReturn);
      return allowanceReturn;
    } catch (error) {
      setDialog('Allowance check error: ', error);
      setButtonText('Retry.');
      console.log('getAllowance error: ', error);
      setTrading(false);
      return undefined;
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
        setTrading(false);
      });
  };

  async function compareAllowance(allowance) {
    if (
      fromToken.token_address &
      (fromToken.token_address !== NATIVE_ADDRESS)
    ) {
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
        await approveInfinity();
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
    setButtonText('Swapping...');
    const params = {
      chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: fromToken.address || NATIVE_ADDRESS, // The token you want to swap
      toTokenAddress: toToken.address || NATIVE_ADDRESS, // The token you want to receive
      amount: txAmount,
      fromAddress: userAddress, // Your wallet address
      slippage: 1,
      gasPrice: 2 * estimatedGas,
      gasLimit: 4 * estimatedGas,
      referrerAddress: REFERRER_ADDRESS,
      fee: REFERRER_FEE,
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
        setButtonText('Trade Again!');
        return receipt;
      })
      .catch((error) => {
        if (error.code === 4001) {
          setDialog(
            'Transaction canceled in MetaMask.  ' +
              'No funds swapped.  ' +
              'No fees charged.  ' +
              'Adjust trade and try again.'
          );
          setButtonText('Redo trade.');
          console.log('Swap transaction canceled in MetaMask.com.');
        } else {
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
    const allowance = getAllowance();
    compareAllowance(allowance);
    swap()
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
              disabled={false}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={trading}
              onClick={handleClick}
              className={allowance < txAmount ? 'quote-button' : 'quote-button'}
            >
              {buttonText}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
