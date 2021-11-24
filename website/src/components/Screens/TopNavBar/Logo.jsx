import { Stack, Box } from '@mui/material';

import { ReactComponent as LogoSvg } from '../../../media/logos/USAWalletLogo.svg';

const Logo = () => {
  return (
    <Stack direction="row" alignItems="center" spacing={1} m={0.5}>
      <LogoSvg width="70" />
      <Box
        sx={{
          fontFamily: 'LogoFont !important',
          fontSize: '3rem',
          background: 'linear-gradient(to bottom, white, #0000ff, black)',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: '-9px !important',
        }}
      >
        USA Wallet
      </Box>
    </Stack>
  );
};

export default Logo;
