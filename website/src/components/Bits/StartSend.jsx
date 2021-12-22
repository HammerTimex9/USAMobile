import React, { useEffect, useState } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import useTransferAction from '../../actions/useTransferAction';
import { AlertDialog } from '../UW/AlertDialog';

export const StartSend = ({ changeLocalMode }) => {
  const { setDialog } = useExperts();
  const [showSendAlert, setShowSendAlert] = useState(false);
  const [showConfirmedAlert, setShowConfirmedAlert] = useState(false);
  const { fromToken, fromTokenAddress, toTokenAddress, txAmount } =
    useActions();
  const { fetch, isFetching, data, error } = useTransferAction({
    amount: txAmount,
    decimals: fromToken?.decimals,
    receiver: toTokenAddress,
    contractAddress: fromTokenAddress,
  });

  useEffect(() => {
    if (isFetching) {
      console.log('isFetching:', isFetching);
      setDialog('Sending Tx for a wallet signature...');
    }
  }, [isFetching, setDialog]);

  useEffect(() => {
    if (data) {
      setDialog('Your signed transaction was sent to network!');
      onSendSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (error) {
      setDialog('Something went wrong: ' + error.message);
    }
  }, [error, setDialog]);

  // TODO: I am writing in functions,
  // in Future we can add other code here if need anything else on clicks.

  const onSendSuccess = () => {
    setShowConfirmedAlert(true);
  };
  const handleSendClick = () => {
    setShowSendAlert(true);
  };
  const closeSendAlert = (value) => {
    console.log('CloseValue:', value);
    setShowSendAlert(false);
    if (value) {
      fetch();
    }
  };
  const closeConfirmedAlert = (value) => {
    setShowConfirmedAlert(false);
    changeLocalMode();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Tooltip title="Preview token transmission.">
        <span>
          <Button
            variant="uw-solid"
            sx={{
              boxShadow: 'var(--boxShadow)',
              background: 'var(--solid-button-bg)',
              color: 'var(--solid-button-color)',
            }}
            onClick={changeLocalMode} //changeLocalMode
          >
            Cancel
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Preview token transmission.">
        <span>
          <LoadingButton
            disabled={!txAmount || !toTokenAddress}
            loading={isFetching}
            onClick={handleSendClick} //fetch
            sx={{
              boxShadow: 'var(--boxShadow)',
              background:
                !txAmount || !toTokenAddress || isFetching
                  ? 'grey.100'
                  : 'var(--solid-button-bg)',
              color: 'var(--solid-button-color)',
            }}
          >
            Send
          </LoadingButton>
        </span>
      </Tooltip>
      <AlertDialog open={showSendAlert} onClose={closeSendAlert}>
        {`Do you wanna send ${fromToken?.symbol} ` +
          `${txAmount} to wallet number ` +
          `${toTokenAddress} ?`}
      </AlertDialog>

      <AlertDialog
        open={showConfirmedAlert}
        onClose={closeConfirmedAlert}
        showCancel={false}
      >
        {`Your ${fromToken?.symbol} ` +
          `has been sent successfully, ` +
          `Check your transaction history!`}
      </AlertDialog>
    </Box>
  );
};
