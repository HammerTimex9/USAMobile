import { useState, useCallback } from 'react';

import useUpdaters from './_useUpdaters';

import { useNetwork } from '../contexts/networkContext';

const axios = require('axios');

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0';
const ENDPOINT = '/quote';
const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

const useQuoteAction = ({ fromTokenAddress, toTokenAddress, amount }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [callData, setCallData] = useState({});
  const [error, setError] = useState();
  const updaters = useUpdaters({
    setIsFetching,
    setCallData,
    setError,
  });
  const { network } = useNetwork();

  const fetch = useCallback(async () => {
    updaters.current?.setIsFetching(true);
    updaters.current?.setCallData();
    updaters.current?.setError();

    setCallData({
      fromTokenAddress: fromTokenAddress || NATIVE_ADDRESS,
      toTokenAddress: toTokenAddress || NATIVE_ADDRESS,
      amount: amount,
      fee: REFERRER_FEE,
    });

    try {
      console.groupCollapsed('useQuoteAction');
      console.log('url:', ENDPOINT);
      console.log('baseURL:', ONEINCH4_API + '/' + network.id.toString());
      console.log('callData:', callData);
      const message = await axios({
        method: 'get',
        url: ENDPOINT,
        baseURL: ONEINCH4_API + '/' + network.id.toString(),
        data: callData,
      });
      updaters.current?.setData(message);
      console.log('message:', message);
      console.groupEnd();
    } catch (e) {
      updaters.current?.setError(e);
    }

    updaters.current?.setIsFetching(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updaters, network.id, fromTokenAddress, toTokenAddress, amount]);

  return { fetch, isFetching, callData, error };
};

export default useQuoteAction;
