import { useNetwork } from '../../networkContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from '../../TradeButtonContext';

export const useHealthCheck = () => {
  const { network } = useNetwork();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton() | {};
  const BASEURL = 'https://api.1inch.io/v4.0/';
  const ENDPOINT = '/healthcheck';

  const getHealthCheck = async () => {
    const outputText = 'Checking ' + network + ' 1Inch router health...';
    setDialog(outputText);
    setButtonText('HealthCheck...');
    console.log(outputText);
    const url = BASEURL + network + ENDPOINT;
    return await fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        setDialog('Healthcheck: ' + res.status + '.');
        setButtonText(res.status);
        return res.status;
      })
      .catch((error) => {
        setDialog('Healthcheck error: ', error.message);
        setButtonText('Retry');
        console.log('Healthcheck error:', error);
        return undefined;
      });
  };
  return { getHealthCheck };
};
