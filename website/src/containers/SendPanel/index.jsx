import { Box, Stack } from '@mui/material';

import { FromSelect } from '../Bits/FromSelect';
import { AmountInput } from '../Bits/AmountInput';
import { StartSend } from '../Bits/StartSend';
// Send mode.
import { ToAddress } from '../Bits/ToAddress';

// import { useActions } from '../../contexts/actionsContext';

export const SendPanel = ({ changeLocalMode }) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        minWidth: 420,
        maxWidth: 660,
        m: 'auto',
        borderRadius: '1.5rem',
        border: 4,
        borderColor: 'var(--border-color)',
      }}
    >
      <Stack
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'center',
          px: 5,
          py: 2.5,
        }}
        spacing={3}
      >
        <FromSelect sx={{ width: '100%', minWidth: 420 }} />
        <>
          <AmountInput />
          <ToAddress />
          <Stack sx={{ width: '100%' }} direction="row" spacing={1}>
            <StartSend changeLocalMode={changeLocalMode} />
          </Stack>
        </>
      </Stack>
    </Box>
  );
};
