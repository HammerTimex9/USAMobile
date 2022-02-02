import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useNetwork } from '../contexts/networkContext';

export const useMoralisRawWeb3 = (data) => {
  const { isAuthenticated, Moralis, isWeb3Enabled } = useMoralis();
  const { setNetworkId, setHasPolygon } = useNetwork();
  const { setDialog } = useExperts();

  useEffect(() => {}, []);

  return { send4Signature, confirmations };
};
