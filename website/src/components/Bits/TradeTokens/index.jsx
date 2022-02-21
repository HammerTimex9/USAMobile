import { useEffect, useState, useRef } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMoralis } from 'react-moralis';

import { useActions } from '../../../contexts/actionsContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useColorMode } from '../../../contexts/colorModeContext';
import { useNetwork } from '../../../contexts/networkContext';

import { usePolygonNetwork } from '../../../hooks/usePolygonNetwork';
import MetaMaskOnboarding from '@metamask/onboarding';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH_API = 'https://api.1inch.io/v4.0/';
const GENERATE_SWAP_ENDPOINT = '/swap';
const REFERRER_ADDRESS = process.env.REACT_APP_ONEINCH_REFERRER_ADDRESS;
const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

export const TradeTokens = () => {
  const { fromToken, toToken, txAmount } = useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();

  const { Moralis } = useMoralis();
  const { network } = useNetwork();
  const { switchNetworkToPolygon } = usePolygonNetwork();
  const [provider, setProvider] = useState({});
  const [user, setUser] = useState({});
  const onboarding = useRef();

  const [buttonText, setButtonText] = useState('Trade Tokens');
  const [trading, setTrading] = useState(false);
  const [allowance, setAllowance] = useState('0');

  const generateSwapAPI =
    ONEINCH_API + network.id.toString() + GENERATE_SWAP_ENDPOINT;

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    Moralis.User.currentAsync().then(function (u) {
      console.log('user:', u);
      setUser(u);
    });
  }, [Moralis.User]);

  async function setupProvider() {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      console.log('MetaMask not detected! Onboarding MetaMask...');
      onboarding.current.startOnboarding();
    }
    const p = await Moralis.enableWeb3();
    setProvider(p);
    console.log('provider:', p);
    return p;
  }

  async function assurePolygon(provider) {
    if (provider?.eth.getChainId() !== 137) {
      return await switchNetworkToPolygon();
    } else {
      return true;
    }
  }

  async function getAllowance() {
    if (fromToken?.token_address === undefined) {
      console.log('Attempted to get allowance without a token address.');
      console.log('fromToken:', fromToken);
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
        fromAddress: user?.attributes['ethAddress'], // Your wallet address
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
        fromAddress: user?.attributes['ethAddress'], // Your wallet address
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
    if (fromToken?.token_address === undefined) {
      const message =
        'Attempted to compare allowance without a fromToken address.';
      setDialog(message);
      setButtonText('Address error.');
      console.log(message, fromToken);
      return false;
    }
    if (fromToken?.token_address === NATIVE_ADDRESS) {
      const message = 'Attempted to compare allowance on a native token.';
      setDialog(message);
      setButtonText('Native allowance?');
      console.log(message, fromToken);
      return true;
    }

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
      return await approveInfinity();
    }
  }

  const prepSwapTx = () => {
    const outputText =
      'Preparing transaction to swap ' +
      txAmount / 10 ** fromToken.decimals +
      ' ' +
      fromToken?.symbol +
      ' for ' +
      toToken?.symbol +
      '.';
    setDialog(outputText);
    setButtonText('Prepping Swap...');
    console.log(outputText);
    console.log('fromToken:', fromToken);
    console.log('user:', user);
    const url =
      generateSwapAPI +
      '?fromTokenAddress=' +
      (fromToken?.token_address || NATIVE_ADDRESS) +
      '&toTokenAddress=' +
      (toToken?.address || NATIVE_ADDRESS) +
      '&amount=' +
      txAmount +
      '&fromAddress=' +
      user?.attributes['ethAddress'] +
      '&slippage=1&referrerAddress=' +
      REFERRER_ADDRESS +
      '&fee=' +
      REFERRER_FEE +
      '&disableEstimate=false&allowPartialFill=false';
    console.log('Swap Tx prep url:', url);
    return fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('Swap Tx prepped!');
        setButtonText('Prepped Swap Tx!');
        console.log('Unsigned Swap Tx:', res);
        return res;
      })
      .catch((error) => {
        setDialog('Swap prep error: ', error.message);
        setButtonText('Retry');
        console.log('Swap prep error:', error);
        return undefined;
      });
  };

  const signTransaction = (unsignedTx, title) => {
    if (unsignedTx) {
      setDialog(
        'Please use MetaMask to approve this ' + title + ' transaction.'
      );
      console.log('Tx to sign:', unsignedTx);
      return provider.eth.signTransaction(unsignedTx).catch((error) => {
        setDialog('Tx signature error: ', error.message);
        setButtonText('Retry');
        console.log('Tx signature error:', error);
      });
    } else {
      setDialog('Skipping signature for blank ' + title + ' transaction.');
      setButtonText('Skipping Tx sign...');
      console.log('Skipping Tx signature for ' + title);
    }
  };

  const broadcastTx = (signedTx, title) => {
    setDialog('Sending ' + title + ' to the blockchain...');
    setButtonText('Sending...');
    console.log('Signed Tx for broadcast:', signedTx);
    return provider.eth
      .sendSignedTransaction(signedTx)
      .then((raw) => {
        setDialog('Waiting for ' + title + ' to be mined...');
        setButtonText('Mining...');
        console.log('Waiting for Tx receipt...');
        return provider.waitForTransaction(raw.hash);
      })
      .then((mined) => {
        setDialog('Retrieving Tx receipt...');
        setButtonText('Receipt...');
        console.log('Received receipt:', mined);
        return provider.getTransactionReceipt(mined.hash);
      })
      .catch((error) => {
        setDialog('Tx send error: ', error.message);
        setButtonText('Retry');
        console.log('Tx send error:', error);
      });
  };

  function displaySwapReceipt(receipt) {
    console.log('Swap Transfer 1Inch receipt:', receipt);
  }

  const handleClick = () => {
    setTrading(true);
    Promise.all([
      setupProvider().then(() => assurePolygon()),
      getAllowance().then((a) => compareAllowance(a)),
    ])
      .then(() => {
        prepSwapTx()
          .then((swapTx) => signTransaction(swapTx, 'swap'))
          .then((signedSwapTx) =>
            broadcastTx(signedSwapTx, 'signed swap transaction')
          )
          .then((swapReceipt) => displaySwapReceipt(swapReceipt))
          .catch((error) => {
            setDialog('A swap process error occured: ', error);
            setButtonText('Retry');
            console.log('swap process error:', error);
          });
      })
      .catch((error) => {
        setDialog('A Tx setup error occured: ', error);
        setButtonText('Restart');
        console.log('Setup error: ', error);
      });
    setTrading(false);
  };

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
