import React, { useState, useContext } from 'react';

const ActionsContext = React.createContext();

export const useActions = () => useContext(ActionsContext);

export const ActionsProvider = (props) => {
  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [txAmount, setTxAmount] = useState('');

  return (
    <ActionsContext.Provider
      value={{
        setFromToken,
        fromToken,
        fromTokenAddress: fromToken?.token_address,
        fromTokenSymbol: fromToken?.symbol,
        setToToken,
        toToken,
        toTokenAddress: toToken?.address,
        toTokenSymbol: toToken?.symbol,
        setTxAmount,
        txAmount,
      }}
    >
      {props.children}
    </ActionsContext.Provider>
  );
};

export default ActionsContext;
