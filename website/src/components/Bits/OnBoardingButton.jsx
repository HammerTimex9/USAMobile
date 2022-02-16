import { useEffect, useState, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Button } from '@mui/material';

import { ReactComponent as MetaMask } from '../../media/icons/metamask.svg';
import { useExperts } from '../../contexts/expertsContext';

const ONBOARD_TEXT = 'Click here to install MetaMask!';

export function OnBoardingButton(props) {
  const { user } = useMoralis();
  const [buttonText] = useState(props.text || ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const onboarding = useRef();
  const { setDialog } = useExperts();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (user?.attributes.ethAddress || window.ethereum.selectedAddress) {
        onboarding.current.stopOnboarding();
      }
      setDisabled(true);
    } else {
      setDialog(
        'Click above to install MetaMask in your browser and unlock the world of cryptocurrency.'
      );
    }
  }, [user, setDialog]);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      onboarding.current.startOnboarding();
    }
  };

  if (isDisabled) {
    return null;
  }
  return (
    <Button
      variant="uw"
      onClick={onClick}
      startIcon={<MetaMask />}
      endIcon={props.endIcon}
    >
      {buttonText}
    </Button>
  );
}
