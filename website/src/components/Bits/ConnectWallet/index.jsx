import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Button, Tooltip } from '@mui/material';

import { LogOutSvg } from '../../../assets/icons';
import { WalletSvg } from '../../../assets/icons';

export const ConnectWallet = () => {
  const { authenticate, isAuthenticated, isAuthenticating, logout } =
    useMoralis();
  const [buttonText, setButtonText] = useState();

  useEffect(() => {
    if (isAuthenticated) {
      setButtonText('Log Out');
    } else {
      setButtonText('Connect Wallet');
    }
  }, [isAuthenticated]);

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
    <Tooltip title="MetaMask Connection.">
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
