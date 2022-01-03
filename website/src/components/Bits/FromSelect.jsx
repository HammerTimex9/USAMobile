import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Select from 'react-select';

import { usePositions } from '../../contexts/portfolioContext';
import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';

export const FromSelect = ({ sx = {} }) => {
  const history = useHistory();
  const location = useLocation();
  const [symbol, setSymbol] = useState(location.state?.fromSymbol);
  const { positions } = usePositions();
  const { setFromToken } = useActions();
  const { setDialog } = useExperts();
  const { isPolygon } = useNetwork();

  useEffect(() => {
    if (location.state?.fromSymbol) {
      const { state } = location;
      delete state.fromSymbol;
      history.replace(location.pathname, state);
    }
  }, [history, location]);

  useEffect(() => {
    return () => {
      setFromToken();
    };
  }, [setFromToken]);

  useEffect(() => {
    setFromToken(positions.find((o) => o.symbol === symbol));
  }, [symbol, positions, setFromToken]);

  const handleChange = async (item) => {
    setSymbol(item.symbol);

    if (!isPolygon) {
      setDialog(
        'Please Switch network to Polygon to use discount network fees.'
      );
      return;
    }

    setDialog('Next set how much ' + item.symbol + ' to use in this trade. ');
  };

  return (
    <Box sx={[{ width: 195, textAlign: 'start' }, sx]}>
      <label>From</label>
      <Select
        options={positions}
        onChange={handleChange}
        isSearchable={false}
        placeholder="Select a token to act with."
        className="react-select-container"
        classNamePrefix="react-select"
        value={positions.find((o) => o.symbol === symbol)}
        getOptionLabel={(o) => o.symbol}
      />
    </Box>
  );
};
