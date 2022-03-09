import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useActions } from '../../../contexts/actionsContext';
import { useNetwork } from '../../../contexts/networkContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from './TradeButtonContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH_API = 'https://api.1inch.io/v4.0/';
const REFERRER_ADDRESS = process.env.REACT_APP_ONEINCH_REFERRER_ADDRESS;
const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

export const use1Inch = () => {
  const { Moralis } = useMoralis();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton();
  const { fromToken, toToken, txAmount } = useActions();
  const { network } = useNetwork();
  const [user, setUser] = useState({});

  useEffect(() => {
    Moralis.User.currentAsync().then(function (u) {
      console.log('user:', u);
      setUser(u);
    });
  }, [Moralis.User]);

  const prepSwapTx = async () => {
    const GENERATE_SWAP_ENDPOINT = '/swap';
    const generateSwapAPI =
      ONEINCH_API + network.id.toString() + GENERATE_SWAP_ENDPOINT;

    const outputText =
      'Preparing transaction to swap ' +
      txAmount / 10 ** fromToken.decimals +
      ' ' +
      fromToken?.symbol +
      ' for ' +
      toToken?.symbol +
      '.';
    setDialog(outputText);
    setButtonText('Prepping Swap');
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
    return await fetch(url, {
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

  function displaySwapReceipt(receipt) {
    console.log('Swap Transfer 1Inch receipt:', receipt);
  }

  return { user, setUser, prepSwapTx, displaySwapReceipt };
};
