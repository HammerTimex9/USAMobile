import React from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Button } from '@mui/material';

import { ReactComponent as MetaMask } from '../../media/icons/metamask.svg';
import { useNetwork } from '../../contexts/networkContext';
import { useExperts } from '../../contexts/expertsContext';

const ONBOARD_TEXT = 'Click here to install MetaMask!';

export function OnBoardingButton() {
  const [buttonText] = React.useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = React.useState(false);
  const onboarding = React.useRef();
  const { accounts, setAccounts } = useNetwork();
  const { setDialog } = useExperts();

  React.useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  React.useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0 || window.ethereum.selectedAddress) {
        onboarding.current.stopOnboarding();
      }
      setDisabled(true);
    } else {
      setDialog('Click above to install MetaMask in your browser.');
    }
  }, [accounts, setDialog]);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((newAccounts) => setAccounts(newAccounts));
    } else {
      onboarding.current.startOnboarding();
    }
  };

  if (isDisabled) {
    return null;
  }
  return (
    <Button variant="uw" onClick={onClick} startIcon={<MetaMask />}>
      {buttonText}
    </Button>
  );
}
