import { useState, useCallback } from 'react';
import { useMoralis } from 'react-moralis';

import { usePositions } from '../contexts/portfolioContext';
import { useNetwork } from '../contexts/networkContext';
import useUpdaters from './_useUpdaters';
import tokens from '../data/TokenList.json';

const axios = require('axios');

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0';
const ENDPOINT = '/swap';

const useSwapAction = ({
  chain,
  fromTokenAddress,
  toTokenAddress,
  amount,
  fromAddress,
  slippage,
}) => {
  const { Moralis } = useMoralis();
  const { getPositions } = usePositions();
  const [isFetching, setIsFetching] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();
  const updaters = useUpdaters({
    setIsFetching,
    setData,
    setError,
    setIsApproved,
  });
  let user = Moralis.User.current();
  const { network } = useNetwork();

  const fetch = useCallback(async () => {
    updaters.current?.setIsFetching(true);
    updaters.current?.setIsApproved(false);
    updaters.current?.setData();
    updaters.current?.setError();

    const fromAddress = user.get('ethAddress');

    try {
      await Moralis.Plugins.oneInch.approve({
        chain,
        tokenAddress: fromTokenAddress || NATIVE_ADDRESS,
        fromAddress,
      });

      updaters.current?.setIsApproved(true);
      getPositions();

      window.confirm('Are you sure?');

      const data = await axios({
        method: 'get',
        url: ENDPOINT,
        baseURL: ONEINCH4_API + '/' + network.id.toString(),
        data: {
          fromTokenAddress: fromTokenAddress || NATIVE_ADDRESS,
          toTokenAddress: toTokenAddress || NATIVE_ADDRESS,
          amount: amount,
          fromAddress: fromAddress,
          referrerAddress: '0x2Acac84f80b61f399e17607bC70fd8aC2B322E72',
          slippage: 0.5,
          fee: 1.5,
          disableEstimate: false,
          allowPartialFill: false,
        },
      });

      if (toTokenAddress) {
        const token = tokens.find((t) => t.address === toTokenAddress);
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              image: token.image,
            },
          },
        });
      }

      updaters.current?.setData(data);
      getPositions();
    } catch (e) {
      updaters.current?.setError(e);
    }

    updaters.current?.setIsFetching(false);
  }, [
    updaters,
    user,
    Moralis.Plugins.oneInch,
    chain,
    fromTokenAddress,
    getPositions,
    toTokenAddress,
    amount,
  ]);

  return { fetch, isFetching, isApproved, data, error };
};

export default useSwapAction;
