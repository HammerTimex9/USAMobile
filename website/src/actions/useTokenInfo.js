import { useState, useEffect } from 'react';

import useUpdaters from './_useUpdaters';
import geckoCoinIds from '../data/geckoCoinIds.json';

const useTokenInfo = (symbol) => {
  const [data, setData] = useState(false);
  const [prices, setPrices] = useState([]);
  const updaters = useUpdaters({
    setData,
    setPrices,
  });

  useEffect(() => {
    const id = geckoCoinIds[symbol?.toLowerCase()];
    if (id) {
      fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
        .then((data) => data.json())
        .then(updaters.current?.setData);
      fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=7`
      )
        .then((data) => data.json())
        .then(updaters.current?.setPrices);
    } else {
      updaters.current?.setData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol?.toLowerCase()]);

  return { data, prices };
};

export default useTokenInfo;
