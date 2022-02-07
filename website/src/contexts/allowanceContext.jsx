import React, { useState, useContext } from 'react';

const AllowanceContext = React.createContext();

export const useAllowance = () => useContext(AllowanceContext);

export const AllowanceProvider = (props) => {
  const [allowance, setAllowance] = useState(0);

  return (
    <AllowanceContext.Provider
      value={{
        allowance,
        setAllowance,
      }}
    >
      {props.children}
    </AllowanceContext.Provider>
  );
};

export default AllowanceContext;
