import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Stack, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useExperts } from '../../contexts/expertsContext';
import Logo from '../../components/Screens/TopNavBar/Logo';
import { LightSwitch } from '../../components/Bits/LightSwitch';
import { ExpertStage } from '../../components//Screens/ExpertStage';
import { useNetwork } from '../../contexts/networkContext';
import { InstallMetaMaskButton } from '../../components/Bits/InstallMetaMaskButton';
import { AddNetworkButton } from '../../components/Bits/AddNetworkButton';

const Onboarding = () => {
  const { user, logout } = useMoralis();
  const { hasPolygon } = useNetwork();
  const { setDialog } = useExperts();
  const hasMetamask = window.ethereum?.isMetaMask;
  const hasMoralisAddress = !!user?.attributes.accounts;

  useEffect(() => {
    if (!hasMetamask) {
      setDialog(
        'Please click the Sign Up button if you are a new user. If you are a current user please press the Continue button.'
      );
    } else if (!hasMoralisAddress) {
      setDialog(
        "We've not seen this address before.  Let's equip you to explore the cryptocurrency universe. Press below for instructions"
      );
    } else if (!hasPolygon) {
      setDialog(
        'Please use the infinity button below to add Polygon to your MetaMask.'
      );
    } else {
      setDialog('Please unlock your MetaMask to continue.');
    }
  }, [hasMoralisAddress, hasMetamask, setDialog, hasPolygon]);

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
        {!hasMoralisAddress ? (
          <Button
            variant="uw"
            onClick={onboardNewUser}
            endIcon={<ArrowForwardIcon />}
          >
            Sign Up
          </Button>
        ) : null}
        {!hasMetamask ? (
          <InstallMetaMaskButton
            text="Continue"
            endIcon={<ArrowForwardIcon />}
          />
        ) : null}
        {!hasPolygon ? <AddNetworkButton /> : null}
      </Stack>
    </Stack>
  );
};

export default Onboarding;
