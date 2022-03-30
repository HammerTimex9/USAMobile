import { useNetwork } from '../../networkContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from '../../TradeButtonContext';
import { useActions } from '../../../contexts/actionsContext';

export const useAllowanceTx = () => {
  const { network } = useNetwork();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton() | {};
  const { fromToken } = useActions();
  const BASEURL = 'https://api.1inch.io/v4.0/';
  const ENDPOINT = '/approve/transaction';

  const getAllowanceTx = async () => {
    const outputText =
      'Prepping ' + network + ' ' + fromToken.symbol + ' allowance...';
    setDialog(outputText);
    setButtonText('Prepping Allowance...');
    console.log(outputText);
    const url =
      BASEURL + network + ENDPOINT + '?tokenAddress=' + fromToken.token_address;

    return await fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('Gas estimate to unlock allowance: ' + res.gasPrice + '.');
        setButtonText('Allowance Prepped.');
        return res;
      })
      .catch((error) => {
        setDialog('AllowanceTx prep error: ', error.message);
        setButtonText('Retry');
        console.log('AllowanceTx prep error:', error);
        return undefined;
      });
  };
  return { getAllowanceTx };
};
