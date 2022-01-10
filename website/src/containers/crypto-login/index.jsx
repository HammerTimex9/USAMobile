import React, { useState } from 'react';
import { Stack, Button } from '@mui/material';

import { TopNavBar } from '../../components/Screens/TopNavBar';
import { Text } from '../../components/UW/Text';

import { ReactComponent as MetaMask } from '../../media/icons/metamask.svg';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

const ONBOARD_TEXT = 'Add MetaMask to your browser';
const ADD_POLYGON = 'Add Polygon to your MetaMask';

const CryptoLogin = () => {
  const [buttonText] = useState(ONBOARD_TEXT);
  const [polygonButtonText] = useState(ADD_POLYGON);
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
        <Button variant="uw" startIcon={<MetaMask />}>
          {buttonText}
        </Button>
        <Button variant="uw" startIcon={<AllInclusiveIcon />}>
          {polygonButtonText}
        </Button>
      </Stack>
    </Stack>
  );
};

export default CryptoLogin;
