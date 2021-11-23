import React, { useEffect, useState, useContext } from 'react';
import { useMoralis } from 'react-moralis';

import { useNetwork } from '../contexts/networkContext';
import geckoCoinIds from '../data/geckoCoinIds.json';
import allPolygonTokens from '../data/allPolygonTokens.json';

const PortfolioContext = React.createContext();

export const usePositions = () => useContext(PortfolioContext);

export const PortfolioProvider = (props) => {
  const { isInitialized, isAuthenticated, Moralis, user } = useMoralis();
  const { networkName, nativeSymbol, isPolygon } = useNetwork();
  const [positions, setPositions] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(1);
  const [maticPrice, setMaticPrice] = useState(0);

  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      const options = {
        chain: networkName,
        address: user?.attributes.ethAddress,
      };
      Promise.all([
        Moralis.Web3API.account.getNativeBalance(options),
        Moralis.Web3API.account.getTokenBalances(options),
      ])
        .then(([native, erc20]) => {
          const nativeId = geckoCoinIds[nativeSymbol.toLowerCase()];
          const tokens = erc20.filter(({ symbol }) => allPolygonTokens[symbol]);
          Promise.all([
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
                    chain: networkName,
                    exchange: 'quickswap',
                  })
                  .then((data) => data.usdPrice)
              )
            ),
          ]).then(([nativePrice, prices]) => {
            const positions = [
              {
                symbol: nativeSymbol,
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
            setIsLoading(0);
            setMaticPrice(nativePrice);
          });
        })
        .catch(() => {
          setPositions([]);
          setIsLoading(0);
        });
    } else {
      setPositions([]);
      setIsLoading(0);
    }
  }, [
    Moralis,
    user,
    isAuthenticated,
    isInitialized,
    networkName,
    nativeSymbol,
    isPolygon,
  ]);

  return (
    <PortfolioContext.Provider
      value={{
        positions,
        isLoading,
        totalValue,
        maticPrice,
      }}
    >
      {props.children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContext;
