import { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';

import { Box, Button, Stack } from '@mui/material';

import { SendPanel } from '../Blocks/SendPanel';
import { AddressPanel } from '../Blocks/AddressPanel';
import { Heading } from '../UW/Heading';
import { Text } from '../UW/Text';

import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';
import { usePolygonNetwork } from '../../hooks/usePolygonNetwork';

import { ReactComponent as SamUncle } from '../../assets/sam.svg';

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

    // Commented due to UI break
    // setLocalMode('send');
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
      <Heading variant="h4" sx={{ mb: 2 }}>
        Transfer Cryptocurrency
      </Heading>
      {localMode === 'none' && (
        <Stack
          sx={{
            alignItems: 'center',
            backgroundColor: 'blue.500',
            borderRadius: '50%',
            height: 440,
            width: 480,
            p: 3,
          }}
        >
          <Text
            sx={{
              color: 'grey.50',
              fontFamily: 'Roboto !important',
              fontWeight: 'bold',
              lineHeight: '19px',
              my: 3,
              width: 231,
            }}
          >
            Would you like to
            <br />
            send or recieve cryptocurrency?
          </Text>
          <Stack direction="row">
            <Button variant="uw-solid" onClick={handleSendMode} sx={{ mr: 1 }}>
              Send
            </Button>
            <Button variant="uw-solid" onClick={handleReceiveMode}>
              Receive
            </Button>
          </Stack>
          <SamUncle style={{ overflow: 'visible' }} />
        </Stack>
      )}
      <br />
      {localMode === 'send' && <SendPanel />}
      {localMode === 'receive' && <AddressPanel />}
    </Box>
  );
};

export default SendReceive;
