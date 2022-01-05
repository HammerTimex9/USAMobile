import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { useMoralis } from 'react-moralis';
import { Button, Tooltip } from '@mui/material';

import { LogOutSvg } from '../../../assets/icons';

export const AuthButton = () => {
  const history = useHistory();
  const { isAuthenticated, logout } = useMoralis();

  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/');
    }
  }, [history, isAuthenticated]);

  // Commented to test on Local Dev
  // useEffect(() => {
  //   return () => {
  //     window.addEventListener('beforeunload', function (e) {
  //       let confirmationMessage = 'o/';
  //       (e || window.event).returnValue = confirmationMessage;
  //       if (isAuthenticated) logout();
  //       return confirmationMessage;
  //     });
  //   };
  // });

  return (
    <Tooltip title="Log out of USA Wallet.">
      <Button
        variant="uw"
        startIcon={<LogOutSvg style={{ fontSize: 22 }} />}
        onClick={() => logout()}
      >
        Log Out
      </Button>
    </Tooltip>
  );
};
