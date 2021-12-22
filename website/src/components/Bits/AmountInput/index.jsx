import { useEffect, useState } from 'react';
import { Box, FormControl, InputAdornment, TextField } from '@mui/material';

import { useActions } from '../../../contexts/actionsContext';
import { useExperts } from '../../../contexts/expertsContext';
import { Text } from '../../UW/Text';

import './styles.scss';

export const AmountInput = () => {
  const [value, setValue] = useState('');
  const [amount, setAmount] = useState(0);
  // const [usdAmount, setUSDAmount] = useState(0);
  // const [isUSDMode, setIsUSDMode] = useState(false);
  const { fromToken, setTxAmount } = useActions();
  const { setDialog } = useExperts();
  const { price, tokens = 0, decimals = 18, symbol } = fromToken || {};

  useEffect(() => {
    return () => {
      setTxAmount(0);
    };
  }, [setTxAmount]);

  useEffect(() => {
    let v = Number(value) || 0;
    setAmount(v);
  }, [price, value]);

  useEffect(() => {
    if (amount <= tokens) {
      setTxAmount(amount);
    } else {
      setTxAmount(0);
    }

    if (amount > 0) {
      setDialog(
        'Now using ' +
          ((100 * amount) / tokens).toFixed(0) +
          '% of your ' +
          symbol +
          ' in this action.  ' +
          'Press one of the action buttons ' +
          'when you are ready ' +
          'to choose what to do with these tokens.'
      );
    } else {
      setDialog(
        'Use the up and down arrows ' +
          'to select how much ' +
          symbol +
          ' to use in this action.  ' +
          'Arrows step in 10% increments of your balance.'
      );
    }
  }, [amount, decimals, symbol, setDialog, setTxAmount, tokens]);

  const onChange = (e) => {
    const { value } = e.target;
    if (!value.match(/([^0-9.])|(\.\d*\.)/)) {
      setValue(value.match(/^0\d/) ? value.slice(1) : value);
    }
  };

  const onBlur = () => {
    if (value === '' || value === '.') {
      setValue(0);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl sx={{ width: '320px', m: 'auto' }}>
        <TextField
          variant="standard"
          className="amount-input"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="off"
          type="number"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <Text className="amount-input-symbol">{symbol}</Text>
              </InputAdornment>
            ),
          }}
          inputProps={{
            min: 0,
            max: tokens,
            step: (tokens / 10).toPrecision(3),
          }}
        />
        {amount > tokens && (
          <div className="amount-input-bottom-text">Insufficient funds.</div>
        )}
        {amount < tokens && (
          <div className="amount-input-bottom-text">{`Value in USD=${(
            amount * price
          ).toFixed(2)}`}</div>
        )}
      </FormControl>
    </Box>
  );
};
