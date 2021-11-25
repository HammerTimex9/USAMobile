import React, { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Button, Drawer, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import { AuthDrawer } from '../AuthDrawer';
import { DrawerHeader } from '../DrawerHeader';

export const AuthButton = () => {
  const { isAuthenticated, logout } = useMoralis();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => {
    setIsOpen(open);
  };
  const onCloseDrawer = () => {
    console.log('OnClose Drawer.');
  };

  useEffect(() => {
    return () => {
      window.addEventListener('beforeunload', function (e) {
        let confirmationMessage = 'o/';
        (e || window.event).returnValue = confirmationMessage;
        if (isAuthenticated) logout();
        return confirmationMessage;
      });
    };
  });

  return (
    <>
      {isAuthenticated ? (
        <Tooltip title="Log out of USA Wallet.">
          <Button
            variant="uw"
            startIcon={<LockOpenIcon className="nav-bar-icon" />}
            onClick={() => logout()}
          >
            Log Out
          </Button>
        </Tooltip>
      ) : (
        <>
          <Tooltip title="Log into USA Wallet.">
            <Button
              variant="uw"
              startIcon={<LockIcon className="nav-bar-icon" />}
              onClick={() => toggleDrawer(true)}
            >
              Log In
            </Button>
          </Tooltip>
          <Drawer open={isOpen} anchor="right" onClose={onCloseDrawer}>
            <DrawerHeader closeDrawer={() => toggleDrawer(false)}>
              Please sign in.
            </DrawerHeader>
            <AuthDrawer closeDrawer={onCloseDrawer} />
            <Tooltip title="Cancel identity action.">
              <Button
                variant="outline"
                sx={{ mr: 3 }}
                onClick={() => toggleDrawer(false)}
              >
                Cancel
              </Button>
            </Tooltip>
          </Drawer>
        </>
      )}
    </>
  );
};
