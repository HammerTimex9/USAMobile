import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Button, Tooltip } from '@mui/material';

import { LogOutSvg } from '../../../assets/icons';
import { WalletSvg } from '../../../assets/icons';

export const ConnectWallet = () => {
  const { authenticate, isAuthenticated, isAuthenticating, logout, user } =
    useMoralis();
  const [buttonText, setButtonText] = useState();
  const [toolTipText, setToolTipText] = useState();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('ConnectWallet::useEffect authenticated user:', user);
      const address = user.get('ethAddress');
      setButtonText(address ? address.slice(0, 6) + '...' : 'Adrss. Unkn.');
      setToolTipText('Log Out');
    } else {
      setButtonText('Connect Wallet');
      setToolTipText('Connect MetaMask');
    }
  }, [isAuthenticated, user]);

  const logIn = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: 'Connect to USA Wallet.app' })
        .then(function (user) {
          console.log('logged in user:', user);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const logOut = async () => {
    await logout();
    console.log('logged out');
  };

  const handleClick = async () => {
    if (isAuthenticating) {
      logIn();
    } else {
      logOut();
    }
  };

  return (
    <Tooltip title={toolTipText}>
      <Button
        onClick={handleClick}
        startIcon={
          isAuthenticated ? (
            <LogOutSvg style={{ fontSize: 22 }} />
          ) : (
            <WalletSvg style={{ fontSize: 22 }} />
          )
        }
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
};
