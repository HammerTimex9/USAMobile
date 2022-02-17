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
  const { positions } = usePositions();
  const { setFromToken } = useActions();
  const { setDialog } = useExperts();
  const { isPolygon } = useNetwork();
  const [symbol, setSymbol] = useState(location.state?.fromSymbol);
  useEffect(() => {
    // console.log('FromToken::useEffect() wiping state.');
    if (location.state?.fromSymbol) {
      const { state } = location;
      delete state.fromSymbol;
      history.replace(location.pathname, state);
    }
  }, [history, location]);

  useEffect(() => {
    // console.log('FromToken::useEffect() returning setFromToken()');
    return () => {
      setFromToken();
    };
  }, [setFromToken]);

  useEffect(() => {
    // console.log(
    //   'FromToken::useEffect() returning position: ',
    //   positions.find((o) => o.symbol === symbol)
    // );
    setFromToken(positions.find((o) => o.symbol === symbol));
  }, [symbol, positions, setFromToken]);

  const handleChange = async (item) => {
    // console.log('fromToken::handleChange() setSymbol() to ', item.symbol);
    setSymbol(item.symbol);

    if (!isPolygon) {
      // console.log('fromToken::handleChange() non-polygon detected.');
      setDialog(
        'Please Switch network to Polygon to use discount network fees.'
      );
      return;
    }
    setDialog('Next set how much ' + item.symbol + ' to use in this trade. ');
  };

  return (
    <div>
      <Box sx={[{ width: 195, textAlign: 'start' }, sx]}>
        <label>From</label>
        <Select
          options={positions}
          onChange={handleChange}
          isSearchable={false}
          placeholder="Token to give."
          className="react-select-container"
          classNamePrefix="react-select"
          value={positions.find((o) => o.symbol === symbol)}
          getOptionLabel={(o) => o.symbol}
        />
      </Box>
      <label> .</label>
    </div>
  );
};
