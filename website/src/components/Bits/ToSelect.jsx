import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import Select from 'react-styled-select';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useQuote } from '../../contexts/quoteContext';
import { useNetwork } from '../../contexts/networkContext';
import tokenList from '../../data/TokenList.json';

export const ToSelect = () => {
  const { fromTokenSymbol, setToToken } = useActions();
  const { setDialog } = useExperts();
  const { setQuote } = useQuote();
  const { network } = useNetwork();
  const [value, setValue] = useState('');
  const tokens = useMemo(() => {
    let options = [];
    tokenList.forEach((item) => {
      let obj = {};
      if (
        item.networkId == network.id &&
        item.symbol.toLowerCase() !== fromTokenSymbol.toLowerCase()
      ) {
        obj.label = `${item.symbol.toUpperCase()} (${item.name})`;
        obj.value = JSON.stringify(item);
        options.push(obj);
      }
    });
    return options;
  }, [network, fromTokenSymbol]);

  useEffect(() => {
    return () => {
      setToToken();
    };
  }, [setToToken]);

  const handleChange = async (e) => {
    let result = JSON.parse(e);
    if (result) {
      setToToken(result);
      setValue(e);
      setDialog(
        "Press the 'Get Swap Quote' " +
          'to get a quote to swap ' +
          fromTokenSymbol +
          ' to ' +
          result.symbol +
          '.'
      );
    } else {
      setToToken();
      setDialog('Select a token to receive from the pull-down menu.');
    }
    setQuote();
  };

  const filterOptions = (options, { inputValue }) => {
    const str = inputValue.toLowerCase();
    return options.filter(
      (o) =>
        o.symbol.toLowerCase().includes(str) ||
        o.name.toLowerCase().includes(str)
    );
  };
  return (
    <Box sx={{ width: '100%', marginTop: '20px' }}>
      <Select
        options={tokens}
        onChange={handleChange}
        placeholder="Select a token to receive."
        classes={{
          selectValue: 'my-custom-value',
          selectArrow: 'my-custom-arrow',
          selectControl: 'my-custom-input',
          selectMenu: 'my-custom-menu1',
          selectOption: 'custom-option',
          selectMenuOuter: 'my-custom-menu1',
        }}
        value={value}
        optionRenderer={(e) => {
          let option = JSON.parse(e.value);
          return (
            <Box className="select-custom-option" onClick={e.onMouseDown}>
              <img
                width="30"
                src={option.image}
                alt=""
                style={{ borderRadius: '50%' }}
              />
              <span style={{ marginLeft: 15 }}>
                {option.symbol.toUpperCase()}
              </span>
            </Box>
          );
        }}
      />
    </Box>
  );
};
