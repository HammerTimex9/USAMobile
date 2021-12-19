import { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';

import { Box, Button, Stack } from '@mui/material';

import { SendPanel } from '../Blocks/SendPanel';
import { AddressPanel } from '../Blocks/AddressPanel';
import { Heading } from '../UW/Heading';

import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';
import { usePolygonNetwork } from '../../hooks/usePolygonNetwork';

const SendReceive = () => {
  const { setExpert, setDialog } = useExperts();
  const [localMode, setLocalMode] = useState('none');

  const { isAuthenticated } = useMoralis();
  const { switchNetworkToPolygon } = usePolygonNetwork();
  const { isPolygon } = useNetwork();

  useEffect(() => {
    if (isAuthenticated) {
      if (!isPolygon) {
        setDialog('Check your Metamast and Accept Polygon Switch.');
        switchNetworkToPolygon();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPolygon]);

  useEffect(() => {
    setExpert({
      character: 'benfranklin',
      dialog: 'Would you like to send or receive cryptocurrency?',
    });
  }, [setExpert]);

  const handleSendMode = async () => {
    if (!isPolygon) {
      setDialog('Switch network to Polygon');
      return;
    }

    setLocalMode('send');
    setDialog('Select a currency to send.');
  };

  const handleReceiveMode = () => {
    setLocalMode('receive');
    setDialog(
      'Copy your address for pasting or ' +
        'select amount to request to generate a QR code.'
    );
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 1, mb: 3 }}>
      <Heading variant="h4">Transfer Cryptocurrency</Heading>
      <br />
      <Stack sx={{ alignItems: 'center' }}>
        <Stack direction="row">
          <Button onClick={handleSendMode} sx={{ mr: 1 }}>
            Send
          </Button>
          <Button onClick={handleReceiveMode}>Receive</Button>
        </Stack>
      </Stack>
      <br />
      {localMode === 'send' && <SendPanel />}
      {localMode === 'receive' && <AddressPanel />}
    </Box>
  );
};

export default SendReceive;
