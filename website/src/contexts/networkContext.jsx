import React, { useState, useContext } from 'react';

const NetworkContext = React.createContext();

const networks = {
  1: {
    name: 'eth',
    symbol: 'ETH',
  },
  137: {
    name: 'polygon',
    symbol: 'MATIC',
  },
};

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = (props) => {
  const [networkId, setNetworkId] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [hasPolygon, setHasPolygon] = useState(true);

  return (
    <NetworkContext.Provider
      value={{
        setNetworkId,
        networkId,
        networkName: networks[networkId]?.name,
        nativeSymbol: networks[networkId]?.symbol,
        isPolygon: networkId === 137,
        setAccounts,
        accounts,
        hasPolygon,
        setHasPolygon,
      }}
    >
      {props.children}
    </NetworkContext.Provider>
  );
};

export default NetworkContext;
