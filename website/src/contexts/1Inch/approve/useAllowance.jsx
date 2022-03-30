import { useNetwork } from '../../networkContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from './../../TradeButtonContext';
import { useActions } from '../../../contexts/actionsContext';

export const useAllowance = () => {
  const { network } = useNetwork();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton() | {};
  const { fromToken } = useActions();
  const BASEURL = 'https://api.1inch.io/v4.0/';
  const ENDPOINT = '/approve/allowance';

  const getAllowance = async () => {
    const outputText =
      'Retreiving ' + network + ' ' + fromToken.symbol + ' allowance...';
    setDialog(outputText);
    setButtonText('Retreiving Allowance...');
    console.log(outputText);
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const account = accounts[0];
    const url =
      BASEURL +
      network +
      ENDPOINT +
      '?tokenAddress=' +
      fromToken.token_address +
      '&walletAddress=' +
      account;
    return await fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('Allowance: ' + res.allowance + '.');
        setButtonText('Allowance Retrieved.');
        return res.status;
      })
      .catch((error) => {
        setDialog('Allowance error: ', error.message);
        setButtonText('Retry');
        console.log('Allowance error:', error);
        return undefined;
      });
  };
  return { getAllowance };
};
