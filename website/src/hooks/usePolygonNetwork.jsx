import { useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import MetaMaskOnboarding from '@metamask/onboarding';

import { useNetwork } from '../contexts/networkContext';
import { useExperts } from '../contexts/expertsContext';

const CHAIN_ID = 137;
const CHAIN_NAME = 'Polygon Mainnet';
const CURRENCY_NAME = 'MATIC';
const CURRENCY_SYMBOL = 'MATIC';
const RPC_URL = 'https://polygon-rpc.com/';
const BLOCK_EXPLORER_URL = 'https://polygonscan.com/';

export const usePolygonNetwork = () => {
  const { isAuthenticated, Moralis, enableWeb3, isWeb3Enabled } = useMoralis();
  const { setNetworkId, setHasPolygon } = useNetwork();
  const { setDialog } = useExperts();

  useEffect(() => {
    if (isAuthenticated) {
      if (!isWeb3Enabled) {
        enableWeb3();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled, enableWeb3]);

  const switchNetworkToPolygon = () => {
    // To Debug issue of Switching Network
    // console.groupCollapsed('SwitchNetworkToPolygon:');
    // console.log('Metamask:', MetaMaskOnboarding.isMetaMaskInstalled());
    // console.log('isAuthenticated:', isAuthenticated);
    // console.groupEnd();
    if (
      MetaMaskOnboarding.isMetaMaskInstalled() &&
      isAuthenticated &&
      isWeb3Enabled
    ) {
      Moralis.switchNetwork(CHAIN_ID)
        .then(
          (success) => {
            setHasPolygon(true);
            console.log('Success:', success);
            setNetworkId(CHAIN_ID);
            setDialog('Polygon Chain switched successfully.');
          },
          (switchError) => {
            // To Debug issue of Switching Network
            // console.log('SwitchError:', switchError);
            // setDialog(switchError.message);
            setHasPolygon(false);
            if (switchError.code === 4902) {
              // console.log('We will call Add Network here.');
              // addPolygonNetwork();
            } else {
              const message = switchError.message ?? '';
              const testString = 'Unrecognized chain ID';
              if (message.toLowerCase().includes(testString.toLowerCase())) {
                // console.log('We will call Add Network here.');
                // addPolygonNetwork();
              }
            }
          }
        )
        .catch((error) => {
          console.log('SwitchCatch:', error);
          // setDialog(error.message);
        });
    } else {
      // To Debug issue of Switching Network
      // console.log('No MetaMask Fount.');
    }
  };

  const addPolygonNetwork = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      Moralis.addNetwork(
        CHAIN_ID,
        CHAIN_NAME,
        CURRENCY_NAME,
        CURRENCY_SYMBOL,
        RPC_URL,
        BLOCK_EXPLORER_URL
      )
        .then(
          (success) => {
            if (typeof success == 'undefined') {
              setDialog('Polygon Network added to Metamask successfully.');
              setNetworkId(CHAIN_ID);
            }
          },
          (error) => {
            setDialog('There is an error in adding Network, Please try again.');
          }
        )
        .catch((error) => {
          setDialog('There is an error in adding Network, Please try again.');
        });
    } else {
      // setDialog('Install MetaMask First.');
    }
  };

  return { switchNetworkToPolygon, addPolygonNetwork };
};
