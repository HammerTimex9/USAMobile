import { useState, useCallback } from 'react';

import useUpdaters from './_useUpdaters';

import { useNetwork } from '../contexts/networkContext';

const axios = require('axios');

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0';
const ENDPOINT = '/approve';

const useSetAllowanceAction = ({ fromTokenAddress, amount }) => {
  const { network } = useNetwork();
  const [isForging, setIsForging] = useState(false);
  const [Tx, setTx] = useState();
  const [forgeError, setForgeError] = useState();
  const updaters = useUpdaters({
    setIsForging,
    setTx,
    setForgeError,
  });

  const forgeTx = useCallback(async () => {
    updaters.current?.setIsForging(true);
    updaters.current?.setTx();
    updaters.current?.setForgeError();

    // Check current allowance
    try {
      const data = await axios({
        method: 'get',
        url: ENDPOINT + '/transaction',
        baseURL: ONEINCH4_API + '/' + network.id.toString(),
        data: {
          tokenAddress: fromTokenAddress || NATIVE_ADDRESS,
          amount: amount,
        },
      });
      updaters.current?.setTx(data);
    } catch (e) {
      updaters.current?.setForgeError(e);
    }

    updaters.current?.setIsForging(false);
  }, [updaters, network.id, fromTokenAddress, amount]);

  return { forgeTx, isForging, Tx, forgeError };
};

export default useSetAllowanceAction;
