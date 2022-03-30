import { useExperts } from '../../../contexts/expertsContext';
import { useNetwork } from '../../../contexts/networkContext';
import { useTradeButton } from '../../../contexts/TradeButtonContext';

export const useMetaMask = () => {
  const { provider } = useNetwork();
  const { setDialog } = useExperts();
  const { setButtonText } = useTradeButton();

  const signTransaction = async (unsignedTx, title) => {
    if (!window.ethereum.isConnected()) {
      setDialog('RPC Provider is not connected.');
      console.log('PRC Provider is not connected.');
      setButtonText('Reconnect');
      return undefined;
    }
    if (unsignedTx.tx) {
      setDialog(
        'Please use MetaMask to approve this ' + title + ' transaction.'
      );
      setButtonText('Tx to sign');
      unsignedTx.tx.gas = unsignedTx.tx.gas.toString();
      console.log('Tx to sign:', unsignedTx.tx);
      return await window.ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [unsignedTx.tx],
        })
        .then((result) => {
          setDialog('Tx receipt hash:', result);
          setButtonText('Success!  Repeat?');
          console.log('Tx result:', result);
          return result;
        })
        .catch((error) => {
          setDialog('Tx signature error: ', error.message);
          setButtonText('Retry');
          console.log('Tx signature error:', error);
        });
    } else {
      setDialog('Skipping signature for blank ' + title + ' transaction.');
      setButtonText('Skipping Tx sign');
      console.log('Skipping Tx signature for ' + title);
    }
  };

  const broadcastTx = async (signedTx, title) => {
    setDialog('Sending ' + title + ' to the blockchain...');
    setButtonText('Sending...');
    console.log('Signed Tx for broadcast:', signedTx);
    return await provider.eth
      .sendSignedTransaction(signedTx)
      .then((raw) => {
        setDialog('Waiting for ' + title + ' to be mined...');
        setButtonText('Mining...');
        console.log('Waiting for Tx receipt...');
        return provider.waitForTransaction(raw.hash);
      })
      .then((mined) => {
        setDialog('Retrieving Tx receipt...');
        setButtonText('Receipt...');
        console.log('Received receipt:', mined);
        return provider.getTransactionReceipt(mined.hash);
      })
      .catch((error) => {
        setDialog('Tx send error: ', error.message);
        setButtonText('Retry');
        console.log('Tx send error:', error);
      });
  };

  return { signTransaction, broadcastTx };
};
