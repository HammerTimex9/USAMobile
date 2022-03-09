import React, { useState, useContext, useEffect, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import detectEthereumProvider from '@metamask/detect-provider';
import networkList from '../data/NetworkList.json';

const NetworkContext = React.createContext();

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = (props) => {
  const { isAuthenticated, isWeb3Enabled, enableWeb3, Moralis } = useMoralis();
  const [provider, setProvider] = useState({});
  const [networkId, setNetworkId] = useState(0);
  const [hasPolygon, setHasPolygon] = useState(false);
  const onboarding = useRef();

  useEffect(() => {
    if (isAuthenticated) {
      const hasMetamask = window.ethereum?.isMetaMask;
      const user = Moralis.User.current();
      const hasAddress = !!user?.get('ethAddress');
      if (hasMetamask && hasAddress) {
        if (!isWeb3Enabled) {
          enableWeb3();
          return;
        }

        Moralis.switchNetwork(137).then(
          () => {
            setHasPolygon(true);
          },
          (switchError) => {
            setHasPolygon(false);
          }
        );
      } else {
        setHasPolygon(false);
      }
    }
  }, [isAuthenticated, isWeb3Enabled, Moralis, enableWeb3]);

  /**
   * TODO: Need to review this and add more checkes for enable Web3.
   */
  useEffect(() => {
    if (isAuthenticated) {
      const user = Moralis.User.current();
      const ethAddress = user?.attributes.ethAddress;
      if (ethAddress) {
        //Used for Debugging
        // console.log(
        //   'We have User Eth Address and we are not calling this anymore.'
        // );
        setNetworkId(137); // We are doing this , because we have to select NetworkId to use app.
      } else {
        if (isWeb3Enabled) {
          Moralis.getChainId().then(setNetworkId);
        } else {
          enableWeb3();
        }
      }
    } else {
      setNetworkId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    Moralis.onChainChanged((chainId) => {
      // console.log('ChainID Changed:', chainId);  //Used for Debugging
      setNetworkId(parseInt(chainId));
    });
  }, [Moralis, isAuthenticated]);

  const setupProvider = async () => {
    const p = await detectEthereumProvider();
    if (p) {
      setProvider(p);
      console.log('provider:', p);
      return p;
    } else {
      console.log('MetaMask not detected! Onboarding MetaMask...');
      onboarding.current.startOnboarding();
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        provider,
        setProvider,
        setupProvider,
        setNetworkId,
        network: networkList[networkId],
        isPolygon: networkId === 137,
        hasPolygon,
        setHasPolygon,
      }}
    >
      {props.children}
    </NetworkContext.Provider>
  );
};

export default NetworkContext;
