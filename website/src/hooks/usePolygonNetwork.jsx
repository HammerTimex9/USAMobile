import { useMoralis } from 'react-moralis';
import MetaMaskOnboarding from '@metamask/onboarding';

import { useNetwork } from '../contexts/networkContext';
import { useExperts } from '../contexts/expertsContext';

const CHAIN_ID = 137;
const CHAIN_NAME = 'Polygon Mainnet';
const CURRENCY_NAME = 'Matic';
const CURRENCY_SYMBOL = 'MATIC';
const RPC_URL =
  'https://speedy-nodes-nyc.moralis.io/df08fdd9ffc987fa73735432/polygon/mainnet';
const BLOCK_EXPLORER_URL = 'https://polygonscan.com/';

export const usePolygonNetwork = () => {
  const { isAuthenticated, Moralis, isWeb3Enabled } = useMoralis();
  const { setNetworkId, setHasPolygon } = useNetwork();
  const { setDialog } = useExperts();

  const assurePolygon = (provider) => {
    window.ethereum
      .request({ method: 'net_version' })
      .then((networkId) => {
        if (networkId === '137') {
          console.log('Network is Polygon.');
          return networkId;
        } else {
          console.log('Not Polygon.  Attempting to switch from ', networkId);
          return switchNetworkToPolygon();
        }
      })
      .catch((error) => {
        console.log('networkId error:', error);
        return undefined;
      });
  };

  const switchNetworkToPolygon = (action = 'app') => {
    // To Debug issue of Switching Network
    // console.log('switchNetworkToPolygon Called...');
    // console.groupCollapsed('SwitchNetworkToPolygon:');
    // console.log('Metamask:', MetaMaskOnboarding.isMetaMaskInstalled());
    // console.log('isAuthenticated:', isAuthenticated);
    // console.groupEnd();
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (isAuthenticated) {
        if (isWeb3Enabled) {
          Moralis.switchNetwork(CHAIN_ID)
            .then(
              (success) => {
                setHasPolygon(true);
                // console.log('Success:', success);
                // console.log('If Success!');
                setNetworkId(CHAIN_ID);
                setDialog('Polygon Chain switched successfully.');
              },
              (switchError) => {
                // To Debug issue of Switching Network
                console.log('SwitchError:', switchError);
                // setDialog(switchError.message);
                setHasPolygon(false);
                if (switchError.code === 4902) {
                  // console.log('If Error!');
                  // console.log('We will call Add Network here.');
                  // addPolygonNetwork();
                } else {
                  const message = switchError.message ?? '';
                  const testString = 'Unrecognized chain ID';
                  if (
                    message.toLowerCase().includes(testString.toLowerCase())
                  ) {
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
          // console.log('Web3 is not enabled.');
          const user = Moralis.User.current();
          const ethAddress = user?.attributes.ethAddress;
          if (ethAddress) {
            //Used for Debugging
            // console.log(
            //   'We have User Eth Address and we are not calling this anymore.'
            // );
            setNetworkId(CHAIN_ID);
          }
        }
      } else {
        console.log('User is Not Authenticated.');
      }
    } else {
      // To Debug issue of Switching Network
      console.log('No MetaMask Found.');
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

  return { assurePolygon, switchNetworkToPolygon, addPolygonNetwork };
};
