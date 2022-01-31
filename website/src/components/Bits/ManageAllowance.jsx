import { useEffect } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import useCheckAllowanceAction from '../../actions/useCheckAllowanceAction';
import useSetAllowanceAction from '../../actions/useSetAllowanceAction';

export const ManageAllowance = () => {
  const { fromTokenAddress, fromTokenSymbol, txAmount } = useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();

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
  const { send4Signature, confirmations } = useMoralisRawWeb3({ data: Tx });

  useEffect(() => {
    if (isChecking & !isForging) {
      setDialog(`Checking ${fromTokenSymbol} trading allowance...`);
    } else if (isForging & !isChecking) {
      setDialog(
        `Creating command to unlock ${txAmount} of ${fromTokenSymbol} for trade ...`
      );
    } else if (isChecking & isForging) {
      setDialog(
        `Impatientce error while checking allowance ${txAmount} of ${fromTokenSymbol}.`
      );
    } else if (txAmount - allowance < 0) {
      if (typeof Tx == 'undefined') {
        forgeTx({ fromTokenAddress, txAmount });
      } else {
        if (confirmations < 1) {
          send4Signature({ data: Tx });
        } else {
          setDialog('Allowance unlocked!');
          // TODO: set button style to disabled, green.
        }
      }
    } else {
      setDialog(`${txAmount} of ${fromTokenSymbol} allowance unlocked.`);
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
    if (txAmount > 0 || confirmations >= 1)
      checkAllowance({ fromTokenAddress, txAmount });
  }, [fromTokenAddress, txAmount, confirmations, checkAllowance]);

  useEffect(() => {
    if (getError) {
      setDialog(
        `Checking ${fromTokenSymbol} trading allowance went wrong: ` +
          getError.message
      );
    }
  }, [getError, fromTokenSymbol, setDialog]);

  useEffect(() => {
    if (forgeError) {
      setDialog(
        `Setting ${fromTokenSymbol} trading allowance to ${txAmount} went wrong: ` +
          forgeError.message
      );
    }
  }, [forgeError, fromTokenSymbol, setDialog, txAmount]);

  return (
    // TODO: fix this.
    <Box style={{ marginTop: 20 }}>
      <FormControl id="sendstart" fullWidth>
        <Tooltip title="Check token trading allowance.">
          <span>
            <LoadingButton
              disabled={!txAmount || !toTokenSymbol}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={isFetching}
              onClick={check}
              className={
                !txAmount || !toTokenSymbol
                  ? 'quote-button disable'
                  : 'quote-button'
              }
            >
              {quoteValid ? 'Refresh Swap Quote' : 'GET QUOTE'}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
