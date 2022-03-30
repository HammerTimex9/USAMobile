import { useEffect, useRef } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import MetaMaskOnboarding from '@metamask/onboarding';

import { useExperts } from '../../../contexts/expertsContext';
import { useColorMode } from '../../../contexts/colorModeContext';
import { useNetwork } from '../../../contexts/networkContext';
import { usePolygonNetwork } from '../../../hooks/usePolygonNetwork';
import { useTradeButton } from '../../../contexts/TradeButtonContext';
import { useMetaMask } from './useMetaMask';
import { use1Inch } from '../../../contexts/1Inch/use1Inch';
import { useActions } from '../../../contexts/actionsContext';
import { useQuote } from '../../../contexts/quoteContext';

export const TradeTokens = () => {
  const { setDialog } = useExperts();
  const { trading, setTrading, buttonText, setButtonText, mode, setMode } =
    useTradeButton();
  const { fromToken, txAmount } = useActions();
  const { toToken, toTokenAmount } = useQuote();
  const { colorMode } = useColorMode();

  const { setupProvider } = useNetwork();
  const { assurePolygon } = usePolygonNetwork();
  const { signTransaction, broadcastTx } = useMetaMask();

  const { getAllowance, getAllowanceTx, getHealthCheck, getTradeTx } =
    use1Inch();

  const onboarding = useRef();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  const approveInfinity = () => {
    setDialog('Constructing trading unlock Tx...');
    setButtonText('Generating Unlock...');
    console.log('Generating trading allowance unlock Tx...');
    getAllowanceTx()
      .then((uTx) => {
        setDialog('Please sign this trading allowance unlock transaction.');
        setButtonText('Sign Unlock Tx');
        console.log('Allowance unlock Tx: ', uTx);
        return signTransaction(uTx);
      })
      .then((sTx) => {
        setDialog(
          'Transmitting signed transaction to the mempool to be validated...'
        );
        setButtonText('Validating...');
        broadcastTx(sTx);
      })
      .then((txReceipt) => {
        setDialog(
          'Allowance Tx validated.  All of your ' +
            fromToken.symbol +
            ' is ready to trade...'
        );
        setButtonText('Execute Trade');
        setTrading(false);
        setMode('trade');
      })
      .catch((error) => {
        setDialog('An allowance error occured: ' + error.toString());
        setButtonText('Retry.');
        console.log('Allowance approval error:', error);
      });
  };

  const executeTrade = () => {
    const txDescription =
      'transaction to swap ' +
      txAmount / 10 ** fromToken?.decimals +
      ' ' +
      fromToken.symbol +
      ' for ' +
      toTokenAmount / 10 ** toToken.decimals +
      ' ' +
      toToken.symbol;
    setDialog('Generating' + txDescription + '...');
    setButtonText('Generating swap Tx...');
    console.log('Generating' + txDescription + '...');
    getTradeTx()
      .then((swapTx) => {
        setDialog('Please sign this' + txDescription + '.');
        setButtonText('Sign swap Tx...');
        console.log(
          'Sending ' + txDescription + ' to MetaMask to sign:',
          swapTx
        );
        signTransaction(swapTx, 'swap');
      })
      .then((signedSwapTx) => {
        setDialog('Broadcasting ' + txDescription + ' to the blockchain...');
        setButtonText('Transmitting Tx...');
        console.log(
          'Broadcasting ' + txDescription + ' to the blockchain: ',
          signedSwapTx
        );
        broadcastTx(signedSwapTx, 'signed swap transaction');
      })
      .then((swapReceipt) => {
        setDialog('Completed ' + txDescription + '!');
        setButtonText('Trade Again!');
        console.log('Completed ' + txDescription + '.  Receipt:', swapReceipt);
      })
      .catch((error) => {
        setDialog('A swap process error occured: ', error);
        setButtonText('Retry');
        console.log('swap process error:', error);
      });
  };

  const handleClick = () => {
    setTrading(true);
    if (getHealthCheck()) {
      Promise.All(setupProvider().then((p) => assurePolygon(p)));
      switch (mode) {
        case 'allowance':
          getAllowance()
            .then((allowance) => {
              if (allowance >= txAmount) {
                setDialog(
                  allowance +
                    ' ' +
                    fromToken.symbol +
                    ' is enough allowance to trade.'
                );
                setButtonText('Allowance secured...');
              } else {
                approveInfinity();
              }
            })
            .catch((error) => {
              setDialog('An allowance error occured: ', error);
              setButtonText('Retry');
              console.log('swap process error:', error);
            });
          break;
        case 'trade':
          executeTrade();
          break;
        default:
          setDialog('Unknown mode: ' + mode);
          setButtonText('Retry');
          console.log('Unknown mode: ', mode);
      }
    } else {
      setDialog('Sorry, the 1Inch server is down.  Try again later.');
      setButtonText('Retry later.');
      console.log('Failed 1Inch healthCheck.');
    }
    setTrading(false);
  };

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="allowance" fullWidth>
        <Tooltip title="Execute trade transactions.">
          <span>
            <LoadingButton
              disabled={false}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={trading}
              onClick={handleClick}
              className={'quote-button'}
            >
              {buttonText}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
