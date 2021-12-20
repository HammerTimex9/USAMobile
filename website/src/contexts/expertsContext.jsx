import React, { useState, useContext } from 'react';

const ExpertsContext = React.createContext();

export const useExperts = () => useContext(ExpertsContext);

export const ExpertsProvider = (props) => {
  const [expertsOn, toggleExperts] = useState(true);
  const [character, setCharacter] = useState('unclesam');
  const [dialog, setDialog] = useState('Welcome to money by, of, and for the people.');

  return (
    <ExpertsContext.Provider
      value={{
        expertsOn,
        toggleExperts,
        character,
        setCharacter,
        dialog,
        setDialog,
      }}
    >
      {props.children}
    </ExpertsContext.Provider>
  );
};

export default ExpertsContext;
