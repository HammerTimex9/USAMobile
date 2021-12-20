import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

import Select from 'react-select';

import { usePositions } from '../../contexts/portfolioContext';
import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';

// import { useMoralis } from "react-moralis";

export const FromSelect = ({ sx = {} }) => {
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
      setDialog(
        'Please Switch network to Polygon to use discount network fees.'
      );
      return;
    }

    if (position) {
      setFromToken(position);
      setDialog(
        'Next set how much ' + position.symbol + ' to use in this trade. '
      );
    } else {
      setFromToken();
      setToToken();
      setDialog(
        "Use the 'Select a token to trade' menu " +
          'to start creating an action plan.'
      );
    }
  };

  let options = [];
  if (!waiting) {
    positions.forEach((position) => {
      let obj = {};
      obj.label = position.symbol.toUpperCase();
      obj.value = JSON.stringify(position);
      options.push(obj);
    });
  }
  return (
    <Box sx={[{ width: 195 }, sx]}>
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
