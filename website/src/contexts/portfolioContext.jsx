import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useMoralis } from 'react-moralis';

import { useNetwork } from '../contexts/networkContext';
import geckoCoinIds from '../data/geckoCoinIds.json';
import allPolygonTokens from '../data/allPolygonTokens.json';

const PortfolioContext = React.createContext();

export const usePositions = () => useContext(PortfolioContext);

export const PortfolioProvider = (props) => {
  const { isAuthenticated, Moralis } = useMoralis();
  const { network } = useNetwork();
  const [positions, setPositions] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [maticPrice, setMaticPrice] = useState(0);

  useEffect(() => {
    Moralis.onAccountsChanged((accounts) => {
      Moralis.link(accounts[0]);
    });
  }, [Moralis, isAuthenticated]);

  const getPositions = useCallback(() => {
    if (!network) return;

    const user = Moralis.User.current();
    const address = user.attributes.ethAddress;
    if (!address) return;

    const options = { chain: network.name, address };
    Promise.all([
      Moralis.Web3API.account.getNativeBalance(options),
      Moralis.Web3API.account.getTokenBalances(options),
    ])
      .then(([native, erc20]) => {
        const nativeId = geckoCoinIds[network.symbol.toLowerCase()];
        const tokens = erc20.filter(({ symbol }) => allPolygonTokens[symbol]);
        return Promise.all([
          fetch(
            `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${nativeId}`
          )
            .then((response) => response.json())
            .then((data) => data[nativeId].usd),
          Promise.all(
            tokens.map((item) =>
              Moralis.Web3API.token
                .getTokenPrice({
                  address: item.token_address,
                  chain: network.name,
                  exchange: 'quickswap',
                })
                .then((data) => data.usdPrice)
            )
          ),
        ]).then(([nativePrice, prices]) => {
          const positions = [
            {
              symbol: network.symbol,
              balance: native.balance,
              price: nativePrice,
            },
            ...tokens.map(({ symbol, balance, token_address }, i) => ({
              symbol,
              balance,
              price: prices[i],
              token_address,
            })),
          ].map((item) => {
            const { name, decimals, logoURI } = allPolygonTokens[item.symbol];
            const tokens = item.balance / 10 ** decimals || 0;
            const value = tokens * item.price || 0;
            return {
              id: geckoCoinIds[item.symbol.toLowerCase()],
              ...item,
              tokens,
              value,
              decimals,
              image: logoURI,
              name: name.replace('(PoS)', '').trim(),
            };
          });
          const totalValue = positions.reduce((s, item) => s + item.value, 0);
          setPositions(positions);
          setTotalValue(totalValue);
          setMaticPrice(nativePrice);
        });
      })
      .catch(() => {
        setPositions([]);
        setTotalValue(0);
      });
  }, [Moralis, network]);

  useEffect(() => {
    if (isAuthenticated) {
      getPositions();
    } else {
      setPositions([]);
      setTotalValue(0);
    }
  }, [isAuthenticated, getPositions]);

  return (
    <PortfolioContext.Provider
      value={{
        positions,
        totalValue,
        maticPrice,
        getPositions,
      }}
    >
      {props.children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContext;
