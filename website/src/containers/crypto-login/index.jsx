import React, { useState } from 'react';
import { Stack, Button } from '@mui/material';

import { TopNavBar } from '../../components/Screens/TopNavBar';
import { Text } from '../../components/UW/Text';
import { useMoralis } from 'react-moralis';

import { ReactComponent as MetaMask } from '../../media/icons/metamask.svg';
import { usePolygonNetwork } from '../../hooks/usePolygonNetwork';
import { AuthButton } from '../../components/Bits/AuthButton';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

const ONBOARD_TEXT = 'Add MetaMask to your browser';
const ADD_POLYGON = 'Add Polygon to your MetaMask';

const CryptoLogin = () => {
  const { authenticate } = useMoralis();
  const { addPolygonNetwork } = usePolygonNetwork();
  const [buttonText] = useState(ONBOARD_TEXT);
  const [polygonButtonText] = useState(ADD_POLYGON);
  const addMetamask = async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download.html');
    } else {
      authenticate({ usePost: true });
    }
  };
  const addPloygon = () => {
    addPolygonNetwork();
  };
  return (
    <Stack alignItems="center" spacing={3} py={3}>
      <TopNavBar />
      <Stack
        alignItems="center"
        spacing={3}
        pt={10}
        sx={{
          mt: 1,
          mb: 3,
          width: '100%',
          borderTop: 1,
          borderColor: 'var(--color-white)',
        }}
      >
        <Text sx={{ mb: 2 }}>Onboarding Page</Text>
        <Button onClick={addMetamask} variant="uw" startIcon={<MetaMask />}>
          {buttonText}
        </Button>
        <Button
          onClick={addPloygon}
          variant="uw"
          startIcon={<AllInclusiveIcon />}
        >
          {polygonButtonText}
        </Button>
        <AuthButton />
      </Stack>
    </Stack>
  );
};

export default CryptoLogin;
