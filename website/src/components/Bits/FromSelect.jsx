import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

import Select from 'react-select';

import { usePositions } from '../../contexts/portfolioContext';
import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';

// import { useMoralis } from "react-moralis";

export const FromSelect = () => {
  const [value, setValue] = useState('');
  const { positions, waiting } = usePositions();
  const { setFromToken, setToToken } = useActions();
  const { setDialog } = useExperts();
  const { isPolygon } = useNetwork();

  useEffect(() => {
    return () => {
      setFromToken();
    };
  }, [setFromToken]);

  const handleChange = async (e) => {
    let position = JSON.parse(e.value);
    setValue(e);

    if (!isPolygon) {
      setFromToken();
      setToToken();
      setDialog('Switch network to Polygon');
      return;
    }

    if (position) {
      setFromToken(position);
      setDialog(
        "Use the 'Select amount' to set how much " +
          position.symbol +
          ' to use in this action. '
      );
    } else {
      setFromToken();
      setToToken();
      setDialog(
        "Use the 'Select a token to act with' menu " +
          'to start creating an action plan.'
      );
    }
  };

  let options = [];
  if (!waiting) {
    positions.forEach((position) => {
      let obj = {};
      obj.label = `From ${
        position.tokens && position.tokens.toPrecision(3)
      }${' '}
        ${position.name} @ $
        ${position.price && position.price.toFixed(2)}/
        ${position.symbol && position.symbol.toUpperCase()} = $
        ${position?.value.toFixed(2)}`;
      obj.value = JSON.stringify(position);
      options.push(obj);
    });
  }
  return (
    <Box style={{ width: '400px' }}>
      <Select
        options={options}
        onChange={handleChange}
        isSearchable={false}
        placeholder="Select a token to act with."
        className="react-select-container"
        classNamePrefix="react-select"
        value={value}
      />
    </Box>
  );
};
