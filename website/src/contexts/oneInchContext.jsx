import React, { useContext } from 'react';

import { useAllowance } from './1Inch/approve/useAllowance';
import { useAllowanceTx } from './1Inch/approve/useAllowanceTx';
import { useSpender } from './1Inch/approve/useSpender';
import { useHealthCheck } from './1Inch/healthcheck/useHealthCheck';
import { useQuote } from './1Inch/swap/useQuote';
import { useTrade } from './1Inch/swap/useTrade';

const OneInchContext = React.createContext();

export const use1Inch = () => useContext(OneInchContext);

export const OneInchProvider = (props) => {
  const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const { getAllowance } = useAllowance();
  const { getAllowanceTx } = useAllowanceTx();
  const { getSpenderAddress } = useSpender();
  const { getHealthCheck } = useHealthCheck();
  const { getQuote } = useQuote();
  const { getTradeTx } = useTrade();

  function displaySwapReceipt(receipt) {
    console.log('Swap Transfer 1Inch receipt:', receipt);
  }

  return (
    <OneInchContext.Provider
      value={{
        NATIVE_ADDRESS,
        getAllowance,
        getAllowanceTx,
        getSpenderAddress,
        getHealthCheck,
        getQuote,
        getTradeTx,
        displaySwapReceipt,
      }}
    >
      {props.children}
    </OneInchContext.Provider>
  );
};

export default OneInchContext;
