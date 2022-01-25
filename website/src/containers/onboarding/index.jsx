import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Stack, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useExperts } from '../../contexts/expertsContext';
import Logo from '../../components/Screens/TopNavBar/Logo';
import { LightSwitch } from '../../components/Bits/LightSwitch';
import { ExpertStage } from '../../components//Screens/ExpertStage';

const Onboarding = () => {
  const { user, logout } = useMoralis();
  const { setDialog } = useExperts();
  const hasMetamask = window.ethereum?.isMetaMask;
  const hasAddress = !!user?.get('ethAddress');

  useEffect(() => {
    if (!hasMetamask) {
      setDialog(
        "We've not equipped this browser to explore the cryptocurrency universe. Press below for instructions"
      );
    } else if (!hasAddress) {
      setDialog(
        "Let's equip you to explore the cryptocurrency universe. Press below for instructions"
      );
    } else {
      setDialog(
        "Let's complete your equipment for exploring the cryptocurrency universe"
      );
    }
  }, [hasAddress, hasMetamask, setDialog]);

  const handleContinueClick = () => {
    logout();
    window.open('https://www.usawallet.org/USA-Wallet-Onboarding', '_blank');
  };

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
          onClick={handleContinueClick}
          endIcon={<ArrowForwardIcon />}
        >
          Press here to continue
        </Button>
      </Stack>
    </Stack>
  );
};

export default Onboarding;
