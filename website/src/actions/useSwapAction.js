import { useState, useCallback } from 'react';
import { useMoralis } from 'react-moralis';

import { usePositions } from '../contexts/portfolioContext';
import { useNetwork } from '../contexts/networkContext';
import useUpdaters from './_useUpdaters';
import tokens from '../data/TokenList.json';

const axios = require('axios');

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0';
const ALLOWANCE_ENDPOINT = '/approve/allowance';
const APPROVE_ENDPOINT = '/approve/transaction';
const SWAP_ENDPOINT = '/swap';
const REFERRER_ADDRESS = process.env.REACT_APP_ONEINCH_REFERRER_ADDRESS;
const REFERRER_FEE = process.env.REACT_APP_ONEINCH_REFERRER_FEE;

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
      // await Moralis.Plugins.oneInch.approve({
      //   chain,
      //   tokenAddress: fromTokenAddress || NATIVE_ADDRESS,
      //   fromAddress,
      // });

      // Check current allowances
      const allowance = await axios({
        method: 'get',
        url: '/' + network.id.toString() + ALLOWANCE_ENDPOINT,
        baseURL: ONEINCH4_API,
        data: {
          tokenAddress: fromTokenAddress || NATIVE_ADDRESS,
          walletAddress: fromAddress,
        },
      });

      // Approve more as necessary.
      if (amount - allowance > 0) {
        const approve = await axios({
          method: 'get',
          url: '/' + network.id.toString() + APPROVE_ENDPOINT,
          baseURL: ONEINCH4_API,
          data: {
            tokenAddress: fromTokenAddress || NATIVE_ADDRESS,
            amount: amount - allowance,
          },
        });
      }

      updaters.current?.setIsApproved(true);
      getPositions();

      window.confirm('Are you sure?');

      const data = await axios({
        method: 'get',
        url: '/' + network.id.toString() + SWAP_ENDPOINT,
        baseURL: ONEINCH4_API,
        data: {
          fromTokenAddress: fromTokenAddress || NATIVE_ADDRESS,
          toTokenAddress: toTokenAddress || NATIVE_ADDRESS,
          amount: amount,
          fromAddress: fromAddress,
          slippage: 0.5,
          referrerAddress: REFERRER_ADDRESS,
          fee: REFERRER_FEE,
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
    fromTokenAddress,
    getPositions,
    network.id,
    toTokenAddress,
    amount,
  ]);

  return { fetch, isFetching, isApproved, data, error };
};

export default useSwapAction;
