import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Tooltip, Modal, Box, Typography, Button, Stack } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useQuote } from '../../contexts/quoteContext';
import { useExperts } from '../../contexts/expertsContext';
import { useActions } from '../../contexts/actionsContext';
import { useNetwork } from '../../contexts/networkContext';
import useSwapAction from '../../actions/useSwapAction';

export const DoItButton = () => {
  const { user, isWeb3Enabled, enableWeb3 } = useMoralis();
  const { network } = useNetwork();
  const { setQuote } = useQuote();
  const [confirmModal, setConfirmModal] = useState();
  const { fromTokenAddress, fromTokenSymbol, toTokenAddress, txAmount } =
    useActions();
  const { setDialog } = useExperts();
  const { fetch, isFetching, isApproved, data, error } = useSwapAction({
    chain: network.name,
    fromTokenAddress,
    toTokenAddress,
    amount: txAmount,
    fromAddress: user.attributes.ethAddress,
    slippage: 3,
  });
  useEffect(() => {
    if (isFetching) {
      setDialog(
        'Retrieving pre-approval codes to swap ' +
          txAmount +
          ' of your ' +
          fromTokenSymbol
      );
    }
    if (isFetching && !isApproved) {
      setDialog(
        "Press 'Confirm' to approve spending your crypto for this transaction"
      );
    }
    if (isFetching && isApproved) {
      setDialog(
        'Waiting for the network to register your signed spending approval...'
      );
    }
  }, [isFetching, fromTokenSymbol, txAmount, setDialog, isApproved]);

  useEffect(() => {
    if (isApproved) {
      setDialog('Approval success.');
    }
  }, [isApproved, setDialog]);

  useEffect(() => {
    if (data) {
      setQuote();
      setDialog(
        'Swap success...please allow a few minutes before the new balances appear in your portfolio.'
      );
    }
  }, [data, setQuote, setDialog]);

  useEffect(() => {
    if (error) {
      setDialog('Something went wrong: ' + error.message);
    }
  }, [error, setDialog]);

  const onCloseModal = () => setConfirmModal();
  const handleClick = () => setConfirmModal(true);
  const handleConfirm = () => {
    if (!isWeb3Enabled) {
      enableWeb3();
    }
    onCloseModal();
    fetch();
  };
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: '#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <>
      <Tooltip title="Submit swap order.">
        <LoadingButton
          className="ExpertButton"
          variant="darkblue"
          sx={{ mr: 2 }}
          onClick={handleClick}
          loading={isFetching}
        >
          Do it.
        </LoadingButton>
      </Tooltip>
      <Modal open={!!confirmModal} onBackdropClick={onCloseModal}>
        <Box sx={style}>
          <Typography variant="h5" sx={{ color: '#000' }}>
            Are you sure?
          </Typography>
          <Stack direction="row" spacing={2} sx={{ my: '30px' }}>
            <Button
              sx={{ color: '#000' }}
              variant="contained"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
            <Button
              sx={{ color: '#000' }}
              variant="contained"
              onClick={onCloseModal}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};
