import { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import transakSDK from '@transak/transak-sdk';

import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';

const Transak = () => {
  const { setExpert, setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { Moralis } = useMoralis();
  const user = Moralis.User.current();
  const ethAddress = user?.attributes.ethAddress;
  const emailAddress = user?.attributes.emailAddress;

  // Both keys are the same now.
  const staging_apiKey = process.env.REACT_APP_TRANSAK_STAGING_API_KEY;
  const production_apiKey = process.env.REACT_APP_TRANSAK_API_KEY;

  useEffect(() => {
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
    console.log('user:', user);
    console.log('ethAddress:', ethAddress);
    console.log('emailAddress:', emailAddress);
    const transak = new transakSDK({
      apiKey:
        process.env.NODE_ENV === 'production'
          ? production_apiKey
          : staging_apiKey,
      environment:
        process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING',
      defaultCryptoCurrency: 'MATIC',
      cryptoCurrencyList: 'MATIC',
      walletAddress: ethAddress,
      themeColor: colorMode === 'light' ? 'D37277' : '5865C9',
      fiatCurrency: 'USD',
      email: emailAddress,
      networks: 'polygon',
      network: 'polygon',
      // defaultNetwork: 'matic',
      redirectURL: '',
      hostURL: window.location.origin,
      widgetWidth: '450px',
      widgetHeight: '635px',
      hideMenu: true,
    });
    transak.init();

    transak.on(transak.ALL_EVENTS, (data) => {
      console.log(data);
    });

    transak.on(transak.EVENTS.TRANSAK_WIDGET_OPEN, (data) => {
      setDialog('Place an order to buy cryptocurrency.');
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_CREATED, (data) => {
      console.log(data);
      setDialog('Transak order created');
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (data) => {
      console.log(data);
      setDialog('Transak order successful');
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (data) => {
      console.log(data);
      setDialog('Transak order failed');
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_CANCELLED, (data) => {
      console.log(data);
      setDialog('Transak order cancelled');
    });

    setExpert({ character: 'ladyliberty' });
    setDialog('Buy crypto in the safest way');

    return () => {
      transak.close();
    };
  }, [
    ethAddress,
    emailAddress,
    setExpert,
    setDialog,
    colorMode,
    staging_apiKey,
    production_apiKey,
    user,
  ]);

  return null;
};

export default Transak;
