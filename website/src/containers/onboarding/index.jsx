import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Stack, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useExperts } from '../../contexts/expertsContext';
import Logo from '../../components/Screens/TopNavBar/Logo';
import { LightSwitch } from '../../components/Bits/LightSwitch';
import { ExpertStage } from '../../components//Screens/ExpertStage';
import { OnBoardingButton } from '../../components/Bits/OnBoardingButton';

const Onboarding = () => {
  const { user, logout } = useMoralis();
  const { setDialog } = useExperts();
  const hasMetamask = window.ethereum?.isMetaMask;
  const hasAddress = !!user?.get('ethAddress');

  useEffect(() => {
    if (!hasMetamask) {
      setDialog(
        'Hello, Please click the Sign Up button if you are a new user. If you are a current user please press the Continue button.'
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

  const onboardNewUser = () => {
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
          onClick={onboardNewUser}
          endIcon={<ArrowForwardIcon />}
        >
          Sign Up
        </Button>
        <OnBoardingButton text="Continue" endIcon={<ArrowForwardIcon />} />
      </Stack>
    </Stack>
  );
};

export default Onboarding;
