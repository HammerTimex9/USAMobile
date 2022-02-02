import { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QRCode from 'react-qr-code';

import { Box, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useExperts } from '../../contexts/expertsContext';
import { Heading } from '../../components/UW/Heading';
import { Text } from '../../components/UW/Text';
import { AlertDialog } from '../../components/UW/AlertDialog';

export const AddressPanel = () => {
  const { Moralis, isAuthenticated } = useMoralis();
  const { setDialog } = useExperts();
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState('0x0');
  const user = Moralis.User.current();
  const ethAddress = user?.attributes.ethAddress;

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (copied) {
      setDialog(
        'Your wallet address has been copied to the clipboard.  ' +
          'Carefully check the address before sending!  ' +
          'Malware can change your destination address in the clipboard!'
      );
      setCopied(false);
      setShowAlert(true);
    } else {
      if (isAuthenticated) {
        setData('ethereum:' + user?.attributes['ethAddress'] + '?chainID:137');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copied]);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        minWidth: 420,
        maxWidth: 660,
        m: 'auto',
        mb: 3,
        borderRadius: '1.5rem',
        border: 4,
        borderColor: 'var(--border-color)',
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          px: 5,
          py: 2.5,
        }}
        spacing={6}
      >
        {!ethAddress && (
          <Text sx={{ lineHeight: 2.5, color: 'var(--color)' }}>
            Connect Metamask First to get Address
          </Text>
        )}
        {ethAddress && (
          <>
            <Heading variant="h4">Your Address:</Heading>
            <QRCode value={ethAddress} />
            <Stack
              direction="row"
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 2.5,
                boxShadow: 'var(--box-shadow)',
                background: 'var(--fade-out-bg)',
              }}
            >
              <Text sx={{ lineHeight: 2.5, color: 'var(--color)' }}>
                {ethAddress}
              </Text>
              <CopyToClipboard
                text={data}
                onCopy={(text, result) => setCopied(result)}
              >
                <ContentCopyIcon
                  sx={{
                    width: 'auto',
                    borderColor: '#e2e8f0 !important', // need to confirm this
                    border: 1,
                    borderRadius: '.3rem',
                    alignSelf: 'center',
                    fontSize: '2rem',
                    boxShadow: 'var(--box-shadow)',
                    color: 'var(--color)',
                    p: 1,
                  }}
                />
              </CopyToClipboard>
            </Stack>
          </>
        )}
      </Stack>
      <AlertDialog
        open={showAlert}
        showCancel={false}
        onClose={() => setShowAlert(false)}
      >
        Your link has been copied successfully, you can share your wallet
        number.
      </AlertDialog>
    </Box>
  );
};
