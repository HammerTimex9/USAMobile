import React, { useState, useContext } from 'react';

import networkList from '../data/NetworkList.json';

const NetworkContext = React.createContext();

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = (props) => {
  const [networkId, setNetworkId] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [hasPolygon, setHasPolygon] = useState(true);

  return (
    <NetworkContext.Provider
      value={{
        setNetworkId,
        network: networkList[networkId],
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
