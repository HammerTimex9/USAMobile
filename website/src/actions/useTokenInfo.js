import { useState, useEffect } from 'react';

import useUpdaters from './_useUpdaters';
import geckoCoinIds from '../data/geckoCoinIds.json';

const useTokenInfo = (symbol) => {
  const [data, setData] = useState(false);
  const updaters = useUpdaters({
    setData,
  });

  useEffect(() => {
    const id = geckoCoinIds[symbol?.toLowerCase()];
    if (id) {
      fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
        .then((data) => data.json())
        .then(updaters.current?.setData);
    } else {
      updaters.current?.setData();
    }
  }, [symbol?.toLowerCase()]);

  return data;
};

export default useTokenInfo;
