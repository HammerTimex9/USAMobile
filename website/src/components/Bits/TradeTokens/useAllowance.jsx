import { useMoralis } from 'react-moralis';
import { useNetwork } from '../../../contexts/networkContext';
import { useActions } from '../../../contexts/actionsContext';
import { useExperts } from '../../../contexts/expertsContext';
import { useTradeButton } from './TradeButtonContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const useAllowance = () => {
  const { Moralis, user } = useMoralis();
  const { network } = useNetwork();
  const { fromToken, txAmount } = useActions();
  const { setDialog } = useExperts();
  const { setTrading, setButtonText, setMode } = useTradeButton();

  const getAllowance = async () => {
    if (fromToken?.token_address === undefined) {
      console.log('Attempted to get allowance without a token address.');
      console.log('fromToken:', fromToken);
      setMode('trade');
      return undefined;
    }
    if (fromToken?.token_address === NATIVE_ADDRESS) {
      console.log('Attempted to get allowance on a native token.');
      setMode('trade');
      return undefined;
    }
    setDialog('Checking your token trading allowance...');
    setButtonText('Checking Allowance');
    const params = {
      chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: fromToken.token_address, // The token you want to swap
      fromAddress: user?.attributes['ethAddress'], // Your wallet address
      amount: txAmount, // No decimals
    };
    console.log('params: ', params);
    return Moralis.Plugins.oneInch
      .hasAllowance(params)
      .then((allowanceReturn) => {
        const outputString =
          'Your ' +
          fromToken.symbol.toUpperCase() +
          ' allowance is ' +
          allowanceReturn;
        setDialog(outputString);
        setButtonText('Allowance found');
        console.log('allowance check:', outputString);
        setMode(allowanceReturn ? 'trade' : 'allowance');
        return allowanceReturn;
      })
      .catch((error) => {
        setDialog('Allowance check error: ', error);
        setButtonText('Retry');
        console.log('getAllowance error: ', error);
        return undefined;
      });
  };

  async function approveInfinity() {
    const outputText =
      'Unlocking ' +
      fromToken.symbol +
      ' on ' +
      network.name +
      ' to trade. Please sign in MetaMask.';
    setDialog(outputText);
    console.log(outputText);
    setButtonText('Unlocking ' + fromToken.symbol);
    const props = {
      chain: network.name, // The blockchain you want to use (eth/bsc/polygon)
      tokenAddress: fromToken.token_address, // The token you want to swap
      fromAddress: user?.attributes['ethAddress'], // Your wallet address
    };
    console.log('props:', props);
    try {
      await Moralis.Plugins.oneInch.approve(props);
      const replyText = fromToken.symbol + ' on ' + network.name + ' unlocked!';
      setDialog(replyText);
      console.log(replyText);
      setButtonText(fromToken.symbol + ' unlocked!');
      setMode('trade');
    } catch (error) {
      switch (error.code) {
        case 4001:
          setDialog(
            fromToken.symbol +
              ' trading unlock canceled.  ' +
              'Choose another token to trade or hit Redo Allowance to continue.'
          );
          break;
        default:
          setDialog(
            'A ' +
              error.code +
              ' error occured while unlocking ' +
              fromToken.symbol +
              '.  Hit Redo Allowance to try again.'
          );
      }
      setButtonText('Redo Allowance');
      setTrading(false);
      console.log('Approveal failed. ', error);
    }
  }

  return { getAllowance, approveInfinity };
};
