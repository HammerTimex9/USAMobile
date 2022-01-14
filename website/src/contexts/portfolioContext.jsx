import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useMoralis } from 'react-moralis';

import { useNetwork } from '../contexts/networkContext';
import geckoCoinIds from '../data/geckoCoinIds.json';

const PortfolioContext = React.createContext();

export const usePositions = () => useContext(PortfolioContext);

export const PortfolioProvider = (props) => {
  const { isAuthenticated, Moralis } = useMoralis();
  const { network } = useNetwork();
  const [address, setAddress] = useState();
  const [positions, setPositions] = useState();
  const [totalValue, setTotalValue] = useState(0);
  const [maticPrice, setMaticPrice] = useState(0);

  const getPositions = useCallback(() => {
    const options = { chain: network.name, address };
    Promise.all([
      Moralis.Web3API.account.getNativeBalance(options),
      Moralis.Web3API.account.getTokenBalances(options),
    ])
      .then(([native, erc20]) => {
        const tokens = erc20.filter(
          ({ symbol }) => geckoCoinIds[symbol.toLowerCase()]
        );
        const ids = [network, ...tokens].map(
          ({ symbol }) => geckoCoinIds[symbol.toLowerCase()]
        );
        return Promise.all([
          fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`
          )
            .then((response) => response.json())
            .then((data) => {
              const map = {};
              data.forEach((item) => {
                map[item.symbol.toUpperCase()] = item;
              });
              return map;
            }),
          Promise.all(
            tokens.map((item) =>
              Moralis.Web3API.token.getTokenPrice({
                address: item.token_address,
                chain: network.name,
                exchange: 'quickswap',
              })
            )
          ),
        ]).then(([markets, prices]) => {
          const positions = [
            {
              ...network,
              ...native,
              price: markets[network.symbol].current_price,
            },
            ...tokens.map((item, i) => ({
              ...item,
              price: prices[i].usdPrice,
            })),
          ]
            .map((item) => {
              const tokens = item.balance / 10 ** item.decimals || 0;
              const value = tokens * item.price || 0;
              return {
                ...item,
                tokens,
                value,
                image: markets[item.symbol].image,
                name: item.name.replace('(PoS)', '').trim(),
              };
            })
            .filter(({ value }) => value);
          const totalValue = positions.reduce((s, item) => s + item.value, 0);
          setPositions(positions);
          setTotalValue(totalValue);
          setMaticPrice(positions[0].price);
        });
      })
      .catch((e) => {
        console.log('getPositions error: ', e);
        setPositions([]);
        setTotalValue(0);
      });
  }, [Moralis, address, network]);

  useEffect(() => {
    if (isAuthenticated) {
      const accounts = Moralis.User.current().attributes?.accounts;
      setAddress(accounts ? accounts[0] : '');
    } else {
      setAddress();
    }
  }, [Moralis, isAuthenticated]);

  useEffect(() => {
    Moralis.onAccountsChanged((accounts) => {
      console.log('Account Change', accounts);
      if (accounts && accounts.length > 0) {
        Moralis.link(accounts[0]);
        setAddress(accounts[0]);
      }
    });
  }, [Moralis]);

  useEffect(() => {
    if (!address) {
      setPositions(address === '' ? [] : null);
      setTotalValue(0);
    } else if (!network) {
      console.log('network is undefined');
      setPositions([]);
      setTotalValue(0);
    } else {
      getPositions();
    }
  }, [address, network, getPositions]);

  return (
    <PortfolioContext.Provider
      value={{
        address,
        positions,
        totalValue,
        maticPrice,
        getPositions,
        isLoading: !positions,
      }}
    >
      {props.children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContext;
