import { useState } from 'react';
// import { useMoralis } from 'react-moralis';
// import { useNetwork } from '../contexts/networkContext';

export const useMoralisRawWeb3 = (data) => {
  // const { isAuthenticated, Moralis, isWeb3Enabled } = useMoralis();
  // const { setNetworkId, setHasPolygon } = useNetwork();
  // const ethers = Moralis.web3Library;
  const { confirmations, setConfirmations } = useState(0);
  const { status, setStatus } = useState(0);

  const pushTx = (data) => {
    console.groupCollapsed('useMoralisRawWeb3.jsx::pushTx()');
    console.log('data:', data);
    console.groupEnd();
  };

  const checkStatus = () => {
    setStatus(status + 1);
    setConfirmations(status);
    return status;
  };

  return { pushTx, checkStatus, confirmations };
};
