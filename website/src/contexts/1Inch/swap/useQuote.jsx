import { useNetwork } from '../../networkContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from '../../tradeButtonContext';
import { useActions } from '../../../contexts/actionsContext';

export const useQuote = () => {
  const { network } = useNetwork();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton();
  const { fromToken, toToken, txAmount } = useActions();
  const BASEURL = 'https://api.1inch.io/v4.0/';
  const ENDPOINT = '/approve/transaction';
  const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

  const getQuote = async () => {
    const outputText =
      'Getting a ' + network + ' ' + fromToken.symbol + ' quote...';
    setDialog(outputText);
    setButtonText('Prepping Allowance...');
    console.log(outputText);
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
      '&fee=' +
      REFERRER_FEE;

    return await fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog(
          'Estimating you will get ' +
            res.toTokenAmount +
            ' ' +
            toToken.symbol +
            '.'
        );
        setButtonText('Quote Retreived.');
        return res;
      })
      .catch((error) => {
        setDialog('Quote error: ', error.message);
        setButtonText('Retry');
        console.log('Quote error:', error);
        return undefined;
      });
  };
  return { getQuote };
};
