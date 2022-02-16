import React, { useEffect } from 'react';
import { Stack, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useExperts } from '../../contexts/expertsContext';
import Logo from '../../components/Screens/TopNavBar/Logo';
import { LightSwitch } from '../../components/Bits/LightSwitch';
import { ExpertStage } from '../../components/Screens/ExpertStage';

const NoSafari = () => {
  const { setDialog } = useExperts();

  useEffect(() => {
    setDialog(
      'USA Wallet does not support Safari.  Please use Google Chrome, FireFox, or Brave Browser.'
    );
  }, [setDialog]);

  return (
    <Stack alignItems="center" spacing={3} py={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        maxWidth="750px"
      >
        <Logo />
        <Stack direction="row" alignItems="center" spacing={1} m={0.5}>
          <LightSwitch />
        </Stack>
      </Stack>
      <Stack
        alignItems="center"
        spacing={10}
        pt={10}
        sx={{
          mt: 1,
          mb: 3,
          width: '100%',
          borderTop: 1,
          borderColor: 'var(--color)',
        }}
      >
        <ExpertStage />
        <Button
          variant="uw"
          onClick={window.open('https://www.google.com/chrome/', '_blank')}
          endIcon={<ArrowForwardIcon />}
        >
          Google Chrome
        </Button>
        <Button
          variant="uw"
          onClick={window.open('https://www.mozilla.org/', '_blank')}
          endIcon={<ArrowForwardIcon />}
        >
          Mozilla FireFox
        </Button>
        <Button
          variant="uw"
          onClick={window.open('https://brave.com/', '_blank')}
          endIcon={<ArrowForwardIcon />}
        >
          Brave Browser
        </Button>
      </Stack>
    </Stack>
  );
};

export default NoSafari;
