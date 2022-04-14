import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import Wyre from 'wyre-widget';

import { useExperts } from '../../../contexts/expertsContext';

import { Box } from '@mui/material';
import { Heading } from '../../UW/Heading';

export default function WyreWidget() {
  const { setExpert, setDialog } = useExperts();
  const { Moralis } = useMoralis();
  const user = Moralis.User.current();
  const ethAddress = user?.attributes.ethAddress;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setExpert({ character: 'ladyliberty' });
    setDialog('Matic is the gateway to the latest crypto!');
  }, [setDialog, setExpert]);

  const genSecretKey = () => {
    return Array.prototype.map
      .call(window.crypto.getRandomValues(new Uint8Array(25)), (x) =>
        ('00' + x.toString(16)).slice(-2)
      )
      .join('');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '450px' }}>
      <Heading variant="h4">Portfolio and Prices</Heading>
      <Wyre
        config={{
          env: 'test',
          accountId: process.env.REACT_APP_WYRE_ACCOUNTID, // put your account number here
          auth: {
            type: 'secretKey',
            secretKey: genSecretKey(), // make an API key, put the secret here :)
          },
          operation: {
            type: 'debitcard',
            destCurrency: 'ETH', //change type: can be ETH, DAI, BTC
            destAmount: 0.01,
            dest: ethAddress, // if payment goes through this account will receive the crypto balance
          },
          style: {
            primaryColor: '#0055ff',
          },
        }}
        onReady={() => console.log('ready')}
        onClose={(event) => console.log('close', event)}
        onComplete={(event) => console.log('complete', event)}
        open={open}
      >
        <button onClick={() => setOpen(true)}>Buy ETH</button>
      </Wyre>
    </Box>
  );
}
