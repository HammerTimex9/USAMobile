import { useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Select from 'react-select';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useQuote } from '../../contexts/quoteContext';
import { useNetwork } from '../../contexts/networkContext';
import tokenList from '../../data/TokenList.json';
import geckoCoinIds from '../../data/geckoCoinIds.json';

const customStyles = {
  control: () => ({
    width: 195,
  }),
};

export const ToSelect = () => {
  const history = useHistory();
  const location = useLocation();
  const { fromTokenSymbol, setToToken } = useActions();
  const { setDialog } = useExperts();
  const { setQuote } = useQuote();
  const { network } = useNetwork();
  const [symbol, setSymbol] = useState(location.state?.toSymbol);
  // Just to Debug
  const tokens = useMemo(
    () =>
      tokenList.filter((item) => {
        return (
          (fromTokenSymbol &&
            item.networkId === network?.id &&
            item.symbol.toLowerCase() !== fromTokenSymbol.toLowerCase()) ||
          (!fromTokenSymbol && item.networkId === network?.id)
        );
      }),
    [network, fromTokenSymbol]
  );

  useEffect(() => {
    if (location.state?.toSymbol) {
      const { state } = location;
      delete state.toSymbol;
      history.replace(location.pathname, state);
    }
  }, [history, location]);

  useEffect(() => {
    return () => {
      setToToken();
    };
  }, [setToToken]);

  useEffect(() => {
    setToToken(tokens.find((o) => o.symbol === symbol));
  }, [symbol, tokens, setToToken]);

  useEffect(() => {
    if (fromTokenSymbol === symbol) {
      setSymbol();
    }
  }, [fromTokenSymbol, symbol]);

  const handleChange = async (item) => {
    if (!fromTokenSymbol) {
      setDialog('Please select from token first');
      setSymbol();
      setToToken();
      return;
    }
    setSymbol(item.symbol);
    setDialog(
      "Press the 'Get Trade Quote' " +
        'to get a quote to trade ' +
        fromTokenSymbol +
        ' for ' +
        item.symbol +
        '.'
    );
    setQuote();

    const id = geckoCoinIds[item.symbol?.toLowerCase()];
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=USD`
    )
      .then((data) => data.json())
      .then((data) => {
        item.price = data[`${id}`].usd;
      });
  };

  return (
    <Box sx={{ width: '195px', textAlign: 'start' }}>
      <label>To</label>
      <Select
        options={tokens}
        onChange={handleChange}
        placeholder="Token to receive."
        className="react-select-container"
        classNamePrefix="react-select"
        value={tokens.find((o) => o.symbol === symbol)}
        styles={customStyles}
        getOptionLabel={(o) => o.symbol}
        isDisabled={!fromTokenSymbol}
      />
    </Box>
  );
};
