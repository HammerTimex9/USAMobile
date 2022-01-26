import { useState, useCallback } from 'react';

import useUpdaters from './_useUpdaters';

import { useNetwork } from '../contexts/networkContext';

const axios = require('axios');

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0';
const ENDPOINT = '/quote';

const useQuoteAction = ({
  chain,
  fromTokenAddress,
  toTokenAddress,
  amount,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();
  const updaters = useUpdaters({
    setIsFetching,
    setData,
    setError,
  });
  const { network } = useNetwork();

  const fetch = useCallback(async () => {
    updaters.current?.setIsFetching(true);
    updaters.current?.setData();
    updaters.current?.setError();

    try {
      const data = await axios({
        method: 'get',
        url: ENDPOINT,
        baseURL: ONEINCH4_API + '/' + network.id.toString(),
        data: {
          fromTokenAddress: fromTokenAddress || NATIVE_ADDRESS,
          toTokenAddress: toTokenAddress || NATIVE_ADDRESS,
          amount: amount,
          fee: 1.5,
        },
      });
      updaters.current?.setData(data);
    } catch (e) {
      updaters.current?.setError(e);
    }

    updaters.current?.setIsFetching(false);
  }, [updaters, fromTokenAddress, toTokenAddress, amount, network]);

  return { fetch, isFetching, data, error };
};

export default useQuoteAction;
