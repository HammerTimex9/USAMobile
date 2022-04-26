import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useMoralis } from 'react-moralis';
import { Button, Tooltip } from '@mui/material';

import { LogOutSvg } from '../../../assets/icons';
import { WalletSvg } from '../../../assets/icons';

export const AuthButton = () => {
  const history = useHistory();
  const { authenticate, isAuthenticated, logout } = useMoralis();
  const [buttonText, setButtonText] = useState('Log Out');

  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/');
      setButtonText('Log Out');
    } else {
      setButtonText('Connect Wallet');
    }
  }, [history, isAuthenticated]);

  // Commented to test on Local Dev
  useEffect(() => {
    return () => {
      window.addEventListener('beforeunload', function (e) {
        let confirmationMessage = 'o/';
        (e || window.event).returnValue = confirmationMessage;
        if (isAuthenticated) {
          logout();
        } else {
          authenticate({ signingMessage: 'Log in using Moralis' })
            .then(function (user) {
              console.log('logged in user:', user);
              console.log('User address:', user.get('ethAddress'));
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        return confirmationMessage;
      });
    };
  });

  return (
    <Tooltip title="Log out of USA Wallet.">
      <Button
        variant="uw"
        startIcon={
          isAuthenticated ? (
            <LogOutSvg style={{ fontSize: 22 }} />
          ) : (
            <WalletSvg style={{ fontSize: 22 }} />
          )
        }
        onClick={() => logout()}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
};
