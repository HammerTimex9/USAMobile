import { useState, useCallback } from 'react';
import { useMoralis } from 'react-moralis';

import useUpdaters from './_useUpdaters';
import AddressABI from '../data/Address_ABI.json';

const ADDRESS = '0x4304BAbfcEDEad2E5Eff4c151601B87e3B9cE61e';

const useTransferAction = ({ amount, decimals, receiver, contractAddress }) => {
  const { Moralis, web3 } = useMoralis();
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();
  const updaters = useUpdaters({
    setIsFetching,
    setData,
    setError,
  });

  const fetch = useCallback(async () => {
    updaters.current?.setIsFetching(true);
    updaters.current?.setData();
    updaters.current?.setError();

    try {
      const options = { receiver };
      let contract = new web3.eth.Contract(AddressABI, ADDRESS);
      let isContract = await contract.methods
        .checkIsContract(options.receiver)
        .call();
      if (!isContract) {
        updaters.current?.setError({ message: 'Enter correct address!' });
        updaters.current?.setIsFetching(false);
        return;
      }
      if (contractAddress) {
        options.type = 'erc20';
        options.amount = Moralis.Units.Token(amount, decimals);
        options.contractAddress = contractAddress;
      } else {
        options.type = 'native';
        options.amount = Moralis.Units.ETH(amount, decimals);
      }
      const data = await Moralis.transfer(options);

      updaters.current?.setData(data);
    } catch (e) {
      console.log(e);
      updaters.current?.setError(e);
    }

    updaters.current?.setIsFetching(false);
  }, [amount, decimals, receiver, contractAddress, updaters, Moralis]);

  return { fetch, isFetching, data, error };
};

export default useTransferAction;
