import React, { useState, useContext } from 'react';

const ExpertsContext = React.createContext();

export const useExperts = () => useContext(ExpertsContext);

export const ExpertsProvider = (props) => {
  const [isEnableExpert, enableExpert] = useState(true);
  const [data, setExpert] = useState();

  const setDialog = React.useCallback((dialog) => {
    setExpert((data) => ({ ...data, dialog }));
  }, []);

  return (
    <ExpertsContext.Provider
      value={{
        isEnableExpert,
        enableExpert,
        character: data?.character || 'unclesam',
        pose: data?.pose || 'default',
        dialog: data?.dialog || '',
        setExpert,
        setDialog,
      }}
    >
      {props.children}
    </ExpertsContext.Provider>
  );
};

export default ExpertsContext;
