import { useEffect, useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import useCheckAllowanceAction from '../../actions/useCheckAllowanceAction';
import useSetAllowanceAction from '../../actions/useSetAllowanceAction';
import { useMoralisRawWeb3 } from '../../hooks/useMoralisRawWeb3';

export const RequestAllowance = () => {
  const { fromTokenAddress, fromTokenSymbol, toTokenSymbol, txAmount } =
    useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { buttonText, setButtonText } = useState();
  const { mode, setMode } = useState('idle');

  const { checkAllowance, isChecking, allowance, getError } =
    useCheckAllowanceAction({
      fromTokenAddress: fromTokenAddress,
      amount: txAmount,
    });
  const { forgeTx, isForging, Tx, forgeError } = useSetAllowanceAction({
    fromTokenAddress: fromTokenAddress,
    amount: txAmount,
  });
  // TODO: write this function
  const { pushTx, confirmations } = useMoralisRawWeb3();

  useEffect(() => {
    if (isChecking & !isForging) {
      setDialog(`Checking ${fromTokenSymbol} trading allowance...`);
      setButtonText('Checking allownace.');
      setMode('checking');
    } else if (isForging & !isChecking) {
      setDialog(
        `Creating command to unlock ${txAmount} of ${fromTokenSymbol} for trade ...`
      );
      setButtonText('Creating unlock codes.');
      setMode('forging');
    } else if (isChecking & isForging) {
      setDialog(
        `Impatientce error while checking allowance ${txAmount} of ${fromTokenSymbol}.`
      );
      setDialog('Tx collision...');
      setMode('error');
    } else if (txAmount - allowance < 0) {
      if (typeof Tx == 'undefined') {
        forgeTx({ fromTokenAddress, txAmount });
      } else {
        if (confirmations < 1) {
          setMode('need2sign');
        } else {
          setDialog('Allowance unlocked!');
          setButtonText('Allowance unlocked!');
          setMode('signed');
        }
      }
    } else {
      setDialog(`${txAmount} of ${fromTokenSymbol} allowance unlocked.`);
      setButtonText('Allowance unlocking...');
      setMode('unlocking');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isChecking,
    isForging,
    txAmount,
    allowance,
    Tx,
    fromTokenAddress,
    confirmations,
  ]);

  useEffect(() => {
    if (txAmount > 0 || confirmations >= 1) {
      checkAllowance({ fromTokenAddress, txAmount });
      setMode('checking');
    }
  }, [fromTokenAddress, txAmount, confirmations, checkAllowance, setMode]);

  useEffect(() => {
    if (getError) {
      setDialog(
        `Checking ${fromTokenSymbol} trading allowance went wrong: ` +
          getError.message
      );
      setButtonText('Check error...');
      setMode('error');
    }
  }, [getError, fromTokenSymbol, setDialog, setButtonText, setMode]);

  useEffect(() => {
    if (forgeError) {
      setDialog(
        `Setting ${fromTokenSymbol} trading allowance to ${txAmount} went wrong: ` +
          forgeError.message
      );
      setButtonText('Set error...');
      setMode('error');
    }
  }, [
    forgeError,
    fromTokenSymbol,
    setButtonText,
    setDialog,
    setMode,
    txAmount,
  ]);

  const handleButton = (button) => {
    if (mode === 'need2sign') {
      pushTx({ data: Tx });
      setMode('waiting');
    } else {
      console.groupCollapsed('ManageAllowance::handleButton()');
      console.log('Pressed, but mode is:', mode);
    }
  };

  return (
    // TODO: fix this.
    <Box style={{ marginTop: 20 }}>
      <FormControl id="sendstart" fullWidth>
        <Tooltip title="Manage token trading allowance.">
          <span>
            <LoadingButton
              disabled={mode !== 'need2sign'}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={isChecking || isForging}
              onClick={handleButton}
              className={
                !txAmount || !toTokenSymbol
                  ? 'allowance-button disable'
                  : 'allowance-button'
              }
            >
              {buttonText}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
