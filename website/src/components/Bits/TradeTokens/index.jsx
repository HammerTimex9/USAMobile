import { useEffect, useRef } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import MetaMaskOnboarding from '@metamask/onboarding';

import { useExperts } from '../../../contexts/expertsContext';
import { useColorMode } from '../../../contexts/colorModeContext';
import { useNetwork } from '../../../contexts/networkContext';
import { usePolygonNetwork } from '../../../hooks/usePolygonNetwork';
import { useTradeButton } from './TradeButtonContext';
import { useMetaMask } from './useMetaMask';
import { use1Inch } from './use1Inch';

import { useAllowance } from './useAllowance';

export const TradeTokens = () => {
  const { setDialog } = useExperts();
  const { trading, setTrading, buttonText, setButtonText, mode } =
    useTradeButton();
  const { colorMode } = useColorMode();

  const { setupProvider } = useNetwork();
  const { assurePolygon } = usePolygonNetwork();
  const { getAllowance, approveInfinity } = useAllowance();
  const { signTransaction, broadcastTx } = useMetaMask();
  const { prepSwapTx, displaySwapReceipt } = use1Inch();

  const onboarding = useRef();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  const handleClick = () => {
    setTrading(true);
    switch (mode) {
      case 'allowance':
        getAllowance()
          .then((allowance) => {
            allowance ? console.log('Moving on...') : approveInfinity();
          })
          .then(() => setupProvider())
          .then((p) => assurePolygon(p))
          .catch((error) => {
            setDialog('An allowance error occured: ', error);
            setButtonText('Retry');
            console.log('swap process error:', error);
          });
        break;
      case 'trade':
        prepSwapTx()
          .then((swapTx) => signTransaction(swapTx, 'swap'))
          .then((signedSwapTx) =>
            broadcastTx(signedSwapTx, 'signed swap transaction')
          )
          .then((swapReceipt) => displaySwapReceipt(swapReceipt))
          .catch((error) => {
            setDialog('A swap process error occured: ', error);
            setButtonText('Retry');
            console.log('swap process error:', error);
          });
        break;
      default:
        setDialog('Unknown mode: ' + mode);
        setButtonText('Retry');
        console.log('Unknown mode: ', mode);
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
