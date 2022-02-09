import { useEffect, useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useMoralis } from 'react-moralis';
import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH_API = 'https://api.1inch.io/v4.0/';
const CHECK_ALLOWANCE_ENDPOINT = '/approve/allowance';
const SET_ALLOWANCE_ENDPOINT = '/approve/transaction';
const GENERATE_SWAP_ENDPOINT = '/swap';
const BROADCAST_ENDPOINT = '/broadcast';
const REFERRER_ADDRESS = process.env.REACT_APP_ONEINCH_REFERRER_ADDRESS;
const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

export const TradeTokens = () => {
  const { fromToken, toToken, txAmount } = useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { isAuthenticated, Moralis, user } = useMoralis();
  const { network } = useNetwork();

  const [buttonText, setButtonText] = useState('Trade Tokens.');
  const [trading, setTrading] = useState(false);
  const [allowance, setAllowance] = useState('0');
  const [web3Provider, setWeb3Provider] = useState({});
  const [userAddress, setUserAddress] = useState('');

  const checkAllowanceAPI =
    ONEINCH_API + network.id.toString() + CHECK_ALLOWANCE_ENDPOINT;
  const setAllowanceAPI =
    ONEINCH_API + network.id.toString() + SET_ALLOWANCE_ENDPOINT;
  const generateSwapAPI =
    ONEINCH_API + network.id.toString() + GENERATE_SWAP_ENDPOINT;
  const broadcastAPI = ONEINCH_API + network.id.toString() + BROADCAST_ENDPOINT;

  useEffect(() => {
    if (!Moralis.ensureWeb3IsInstalled()) {
      setTrading(true);
      setDialog('Connecting to the blockchain...');
      setButtonText('Connecting...');
      setWeb3Provider(Moralis.enable());
      setDialog('Choose a token to trade.');
      setButtonText('Complete Trade');
    }
  }, [Moralis, setDialog, user?.attributes]);

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

  function retrieveAllowance(token) {
    setDialog('Checking your token trading allowance...');
    setButtonText('Checking Allowance...');
    const onChainAllowance = fetch(checkAllowanceAPI, {
      tokenAddress: token.address,
      walletAddress: userAddress,
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog(
          token.symbol.toUpperCase() +
            ' allowance is ' +
            res.allowance / 10 ** token.decimals +
            '.'
        );
        setButtonText('Allowance found!');
        return res.allowance;
      })
      .catch((error) => {
        setDialog('Allowance check error: ' + error.message);
        setButtonText('Retry');
        console.log('Allowance check error:', error);
      });
    setAllowance(onChainAllowance);
  }

  function compareAllowance() {
    if (allowance < txAmount)
      throw new Error({
        name: 'InsufficientAllowance',
        message:
          'On-chain allowance of ' +
          allowance / 10 ** fromToken.decimals +
          ' is not enough to trade ' +
          txAmount / 10 ** fromToken.decimals +
          ' ' +
          fromToken.symbol.toUpperCase() +
          ' with.',
      });
  }

  const prepAllowanceTx = (token, txAmount) => {
    setDialog(
      'Preparing to unlock' +
        txAmount / 10 ** token.decimals +
        ' ' +
        token.symbol.toUpperCase() +
        ' for trade.'
    );
    setButtonText('Prepping Unlock...');
    return fetch(setAllowanceAPI, {
      tokenAddress: token.address,
      amount: txAmount,
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('Allowance unlock Tx prepped!');
        setButtonText('Prepped Allowance Tx!');
        return res;
      })
      .catch((error) => {
        setDialog('Allowance prep error: ', error.message);
        setButtonText('Retry');
        console.log('Allowance prep error:', error);
      });
  };

  const prepSwapTx = (fromToken, toToken, txAmount) => {
    setDialog(
      'Preparing transaction to swap ' +
        txAmount / 10 ** fromToken.decimals +
        ' ' +
        fromToken.symbol.toUppperCase() +
        ' for ' +
        toToken.symbol.toUpperCase() +
        '.'
    );
    setButtonText('Prepping Swap...');
    return fetch(generateSwapAPI, {
      fromTokenAddress: fromToken?.address || NATIVE_ADDRESS,
      toTokenAddress: toToken?.address || NATIVE_ADDRESS,
      amount: txAmount,
      fromAddress: userAddress,
      referrer: REFERRER_ADDRESS,
      fee: REFERRER_FEE,
      slippage: 1,
      disableEstimate: false,
      allowPartialFill: false,
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('Swap Tx prepped!');
        setButtonText('Prepped Swap Tx!');
        return res;
      })
      .catch((error) => {
        setDialog('Swap prep error: ', error.message);
        setButtonText('Retry');
        console.log('Swap prep error:', error);
      });
  };

  const signTransaction = (transactionData, title) => {
    setDialog('Please use MetaMask to approve this ' + title + ' transaction.');
    return web3Provider.eth.accounts
      .signTransaction(transactionData)
      .catch((error) => {
        setDialog('Tx signature error: ', error.message);
        setButtonText('Retry');
        console.log('Tx signature error:', error);
      });
  };

  const broadcastTx = (signedTxData, title) => {
    setDialog('Transmitting ' + title + ' to the blockchain...');
    return fetch(broadcastAPI, {
      method: 'post',
      body: JSON.stringify({ signedTxData }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog(
          'Received receipt for ' + title + '. Transaction is complete.'
        );
        return res.transactionHash;
      })
      .catch((error) => {
        setDialog('Tx signature error: ', error.message);
        setButtonText('Retry');
        console.log('Tx signature error:', error);
      });
  };

  function displaySwapReceipt(receipt) {
    console.log('Swap Transfer 1Inch receipt:', receipt);
  }

  const handleClick = () => {
    setTrading(true);
    prepAllowanceTx(fromToken, txAmount)
      .then((allowanceTx) =>
        signTransaction(web3Provider, allowanceTx, 'unlock trading allowance')
      )
      .then((signedAllowanceTx) =>
        broadcastTx(signedAllowanceTx, 'signed trading allowance transaction')
      )
      .then(() => retrieveAllowance())
      .then(() => compareAllowance())
      .then(() => prepSwapTx(fromToken, toToken, txAmount))
      .then((swapTx) => signTransaction(swapTx, 'swap'))
      .then((signedSwapTx) =>
        broadcastTx(signedSwapTx, 'signed swap transaction')
      )
      .then((swapReceipt) => displaySwapReceipt(swapReceipt))
      .catch((error) => {
        setDialog('A swap process error occured: ', error);
        setButtonText('Retry');
        console.log('swap process error:', error);
        setTrading(false);
      });
  };

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="allowance" fullWidth>
        <Tooltip title="Manage token trading allowance.">
          <span>
            <LoadingButton
              disabled={txAmount <= 0}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={trading}
              onClick={handleClick}
              className={
                allowance < txAmount
                  ? 'allowance-button disable'
                  : 'allowance-button'
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
