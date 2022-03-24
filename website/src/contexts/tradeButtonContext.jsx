import React, { useState, useContext, useEffect } from 'react';

const TradeButtonContext = React.createContext();

export const useTradeButton = () => useContext(TradeButtonContext);

export const TradeButtonProvider = (props) => {
  const [trading, setTrading] = useState();
  const [buttonText, setButtonText] = useState();
  const [mode, setMode] = useState('allowance');

  useEffect(() => {
    setButtonText(mode === 'allowance' ? 'Check Allowance' : 'Execute Trade');
  }, [mode]);

  return (
    <TradeButtonContext.Provider
      value={{
        trading,
        setTrading,
        buttonText,
        setButtonText,
        mode,
        setMode,
      }}
    >
      {props.children}
    </TradeButtonContext.Provider>
  );
};

export default TradeButtonContext;
