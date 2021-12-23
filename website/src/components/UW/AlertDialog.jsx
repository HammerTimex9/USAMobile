import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

export const AlertDialog = ({
  sx = {},
  open = false,
  showCancel = true,
  okButtonText = 'Ok',
  cancelButtonText = 'Cancel',
  onClose,
  ...props
}) => {
  const handleClose = (value = false) => {
    onClose(value);
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      sx={{ borderRadius: '10px' }}
    >
      <DialogContent sx={{ minHeight: 120, maxWidth: 320 }}>
        <DialogContentText
          sx={{
            textAlign: 'center',
            wordBreak: 'break-word',
            color: 'var(--color)',
          }}
        >
          {props.children}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-evenly', mb: 2 }}>
        {showCancel && (
          <Button
            autoFocus
            onClick={() => handleClose()}
            variant="uw-solid"
            sx={{
              width: 100,
              height: 40,
              boxShadow: 'var(--box-shadow-outset)',
              background: 'var(--gradient-300)',
              color: 'var(--color-white)',
              fontSize: '1rem !important',
            }}
          >
            {cancelButtonText}
          </Button>
        )}
        <Button
          onClick={() => handleClose(true)}
          variant="uw-solid"
          sx={{
            width: 100,
            height: 40,
            boxShadow: 'var(--box-shadow-outset)',
            background: 'var(--gradient-300)',
            color: 'var(--color-white)',
            fontSize: '1rem !important',
          }}
        >
          {okButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
