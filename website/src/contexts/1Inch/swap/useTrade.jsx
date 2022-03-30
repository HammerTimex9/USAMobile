import { useNetwork } from '../../networkContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from '../../TradeButtonContext';
import { useActions } from '../../../contexts/actionsContext';

export const useTrade = () => {
  const { network } = useNetwork();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton() | {};
  const { fromToken, toToken, txAmount } = useActions();
  const BASEURL = 'https://api.1inch.io/v4.0/';
  const ENDPOINT = '/approve/transaction';
  const REFERRER_ADDRESS = process.env.REACT_APP_ONEINCH_REFERRER_ADDRESS;
  const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

  const getTradeTx = async () => {
    const outputText =
      'Getting a ' + network + ' ' + fromToken.symbol + ' quote...';
    setDialog(outputText);
    setButtonText('Prepping Allowance...');
    console.log(outputText);
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const account = accounts[0];
    const url =
      BASEURL +
      network +
      ENDPOINT +
      '?fromTokenoAddress=' +
      fromToken.token_address +
      '&toTokenAddress=' +
      toToken.address +
      '&amount=' +
      txAmount +
      '&fromAddress=' +
      account +
      '&slippage=' +
      '1' +
      '&referrerAddress=' +
      REFERRER_ADDRESS +
      '&fee=' +
      REFERRER_FEE +
      '&allowPartialFill=' +
      'false';

    return await fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('Swap prepped for signing.');
        setButtonText('Swap Prepped.');
        return res;
      })
      .catch((error) => {
        setDialog('1Inch swap prep error: ', error.message);
        setButtonText('Retry');
        console.log('1Inch swap prep error:', error);
        return undefined;
      });
  };
  return { getTradeTx };
};
