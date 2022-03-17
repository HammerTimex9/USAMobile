import { useNetwork } from '../../../../../contexts/networkContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from './TradeButtonContext';

export const useSpender = () => {
  const { network } = useNetwork();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton();
  const BASEURL = 'https://api.1inch.io/v4.0/';
  const ENDPOINT = '/approve/spender';

  const getSpenderAddress = async () => {
    const outputText = 'Retreiving ' + network + ' 1Inch spender address...';
    setDialog(outputText);
    setButtonText('Retreiving Address...');
    console.log(outputText);
    const url = BASEURL + network + ENDPOINT;
    return await fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('1Inch contract address: ' + res.address + '.');
        setButtonText('DEX Address Retreived.');
        return res.status;
      })
      .catch((error) => {
        setDialog('DEX address error: ', error.message);
        setButtonText('Retry');
        console.log('DEX address error:', error);
        return undefined;
      });
  };
  return { getSpenderAddress };
};
