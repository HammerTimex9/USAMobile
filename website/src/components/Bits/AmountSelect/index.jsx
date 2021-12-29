import { useRef, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useActions } from '../../../contexts/actionsContext';
import { useExperts } from '../../../contexts/expertsContext';
import './styles.scss';

export const AmountSelect = ({ type }) => {
  const history = useHistory();
  const location = useLocation();
  const inputRef = useRef();
  const [value, setValue] = useState(location.state?.amount || '');
  const [amount, setAmount] = useState(0);
  const { fromToken, setTxAmount } = useActions();
  const { setDialog } = useExperts();
  const { price, tokens = 0, decimals = 18, symbol } = fromToken || {};

  useEffect(() => {
    if (location.state?.amount) {
      const { state } = location;
      delete state.amount;
      history.replace(location.pathname, state);
    }
  }, [history, location]);

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
      if (type === 'send') {
        setTxAmount(amount);
      } else {
        setTxAmount(amount * 10 ** decimals);
      }
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
  }, [amount, decimals, symbol, setDialog, setTxAmount, tokens, type]);

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
    <div className="amount-select">
      <div className="amount-select-field">
        <div className="amount-select-amount">
          <div data-value={value}>
            <input
              ref={inputRef}
              id="amount-input"
              autoFocus
              autoComplete="off"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              type="number"
              step={(tokens / 10).toPrecision(3)}
              max={tokens}
              min="0"
              placeholder="Enter Amount"
            />
          </div>
        </div>
      </div>
      {amount > tokens && (
        <div className="amount-select-error">Insufficient funds.</div>
      )}
    </div>
  );
};
