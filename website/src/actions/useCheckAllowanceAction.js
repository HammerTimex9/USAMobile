import { useState, useCallback } from 'react';

import useUpdaters from './_useUpdaters';

import { useNetwork } from '../contexts/networkContext';
import { useMoralis } from 'react-moralis';

const axios = require('axios');

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0';
const ENDPOINT = '/approve';

const useCheckAllowanceAction = ({ fromTokenAddress, amount }) => {
  const { network } = useNetwork();
  const { Moralis } = useMoralis();
  let user = Moralis.User.current();
  const [isChecking, setIsChecking] = useState(false);
  const [allowance, setAllowance] = useState();
  const [getError, setGetError] = useState();
  const updaters = useUpdaters({
    setIsChecking,
    setAllowance,
    setGetError,
  });

  const checkAllowance = useCallback(async () => {
    updaters.current?.setIsFetching(true);
    updaters.current?.setAllowance();
    updaters.current?.setGetError();

    // Check current allowance
    try {
      const data = await axios({
        method: 'get',
        url: ENDPOINT + '/allowance',
        baseURL: ONEINCH4_API + '/' + network.id.toString(),
        data: {
          tokenAddress: fromTokenAddress || NATIVE_ADDRESS,
          walletAddress: user.get('ethAddress'),
        },
      });
      updaters.current?.setAllowance(data?.allowance);
    } catch (e) {
      updaters.current?.setGetError(e);
    }

    updaters.current?.setIsChecking(false);
  }, [updaters, network.id, fromTokenAddress, user]);

  return { checkAllowance, isChecking, allowance, getError };
};

export default useCheckAllowanceAction;
