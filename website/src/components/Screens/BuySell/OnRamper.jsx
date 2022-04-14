import OnramperWidget from '@onramper/widget';
import { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { useExperts } from '../../contexts/expertsContext';

const OnRamper = () => {
  const { user } = useMoralis();
  const { setExpert, setDialog } = useExperts();

  const wallets = {
    ETH: { address: user?.attributes['ethAddress'] },
    MATIC: { address: user?.attributes['ethAddress'] },
  };

  useEffect(() => {
    setExpert({ character: 'ladyliberty' });
    setDialog('Matic is the gateway to the latest crypto!');
  }, [setDialog, setExpert]);

  return (
    <div
      style={{
        width: '440px',
        height: '595px',
      }}
    >
      <OnramperWidget
        API_KEY={process.env.REACT_APP_ONRAMPER_API_KEY}
        defaultAddrs={wallets}
        defaultAmount={100}
        defaultCrypto={'MATIC'}
        defaultFiat={'USD'}
        defaultFiatSoft={'USD'}
        defaultPaymentMethod={'creditCard'}
        filters={{
          onlyCryptos: ['MATIC'],
          onlyFiat: ['USD'],
        }}
        isAddressEditable={false}
        redirectURL={'https://usawallet.app'}
      />
    </div>
  );
};

export default OnRamper;
