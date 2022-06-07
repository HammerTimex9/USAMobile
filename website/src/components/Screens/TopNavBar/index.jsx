import { useMoralis } from 'react-moralis';

import { Stack } from '@mui/material';
import { ExpertButton } from '../../Bits/ExpertButton';

import { LightSwitch } from '../../Bits/LightSwitch';
import { ConnectWallet } from '../../Bits/ConnectWallet';
import { ProfileAvatar } from '../../Bits/ProfileAvatar';
import { AddNetworkButton } from '../../Bits/AddNetworkButton';
import { InstallMetaMaskButton } from '../../Bits/InstallMetaMaskButton';
import { useNetwork } from '../../../contexts/networkContext';
import Logo from './Logo';

export const TopNavBar = () => {
  const { isAuthenticated } = useMoralis();
  const hasMetamask = window.ethereum?.isMetaMask;
  const { hasPolygon, isPolygon } = useNetwork();

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
        {isAuthenticated && hasMetamask && !isPolygon && <AddNetworkButton />}
        <ConnectWallet />
        {isAuthenticated && <InstallMetaMaskButton />}
        {isAuthenticated && <ProfileAvatar />}
      </Stack>
    </Stack>
  );
};
