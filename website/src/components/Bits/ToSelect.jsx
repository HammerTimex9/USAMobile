import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import Select from 'react-select';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useQuote } from '../../contexts/quoteContext';
import { useNetwork } from '../../contexts/networkContext';
import tokenList from '../../data/TokenList.json';
import geckoCoinIds from '../../data/geckoCoinIds.json';

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
        (fromTokenSymbol &&
          item.networkId === network.id &&
          item.symbol.toLowerCase() !== fromTokenSymbol.toLowerCase()) ||
        (!fromTokenSymbol && item.networkId === network.id)
      ) {
        obj.label = `${item.symbol.toUpperCase()}`;
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
    let result = JSON.parse(e.value);
    if (result) {
      const id = geckoCoinIds[result.symbol?.toLowerCase()];
      const priceData = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=USD`
      );
      if (priceData.status === 200) {
        let resultData = await priceData.json();
        result.price = resultData[`${id}`].usd;
      }
      setToToken(result);
      setValue(e);
      setDialog(
        "Press the 'Get Trade Quote' " +
          'to get a quote to trade ' +
          fromTokenSymbol +
          ' for ' +
          result.symbol +
          '.'
      );
    } else {
      setToToken();
      setDialog('Select a token to receive from the pull-down menu.');
    }
    setQuote();
  };

  const customStyles = {
    control: () => ({
      width: 195,
    }),
  };
  return (
    <Box sx={{ width: '195px', textAlign: 'start' }}>
      <label>To</label>
      <Select
        options={tokens}
        onChange={handleChange}
        placeholder="Select a token to receive."
        className="react-select-container"
        classNamePrefix="react-select"
        value={value}
        styles={customStyles}
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
