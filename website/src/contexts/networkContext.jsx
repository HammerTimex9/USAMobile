import React, { useState, useContext, useEffect } from 'react';
import { useMoralis } from 'react-moralis';

import networkList from '../data/NetworkList.json';

const NetworkContext = React.createContext();

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = (props) => {
  const { isAuthenticated, isWeb3Enabled, enableWeb3, Moralis } = useMoralis();
  const [networkId, setNetworkId] = useState();
  const [hasPolygon, setHasPolygon] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      if (isWeb3Enabled) {
        Moralis.getChainId().then(setNetworkId);
      } else {
        enableWeb3();
      }
    } else {
      setNetworkId();
    }
  }, [Moralis, enableWeb3, isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    Moralis.onChainChanged((chainId) => {
      setNetworkId(parseInt(chainId));
    });
  }, [Moralis, isAuthenticated]);

  return (
    <NetworkContext.Provider
      value={{
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
