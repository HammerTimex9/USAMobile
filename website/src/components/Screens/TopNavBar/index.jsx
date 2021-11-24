import { useMoralis } from 'react-moralis';

import { Stack } from '@mui/material';
import { ExpertButton } from '../../Bits/ExpertButton';

import { LightSwitch } from '../../Bits/LightSwitch';
import { AuthButton } from '../../Bits/AuthButton';
import { ProfileAvatar } from '../../Bits/ProfileAvatar';
import { AddNetworkButton } from '../../Bits/AddNetworkButton';
import { OnBoardingButton } from '../../Bits/OnBoardingButton';
import { useNetwork } from '../../../contexts/networkContext';
import Logo from './Logo';

export const TopNavBar = () => {
  const { isAuthenticated } = useMoralis();
  const hasMetamask = window.ethereum?.isMetaMask;
  const { hasPolygon } = useNetwork();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      maxWidth="750px"
    >
      <Logo />

      <Stack direction="row" alignItems="center" spacing={1} m={0.5}>
        {isAuthenticated && hasPolygon && <ExpertButton />}
        <LightSwitch />
        {isAuthenticated && hasMetamask && !hasPolygon && <AddNetworkButton />}
        <AuthButton />
        {isAuthenticated && <OnBoardingButton />}
        {isAuthenticated && <ProfileAvatar />}
      </Stack>
    </Stack>
  );
};
