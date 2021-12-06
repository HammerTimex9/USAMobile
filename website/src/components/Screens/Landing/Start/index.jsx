import React from 'react';

import { Box, Typography, Button } from '@mui/material';

const Start = ({ onNext }) => {
  const onClick = () => {
    onNext(1);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Create your USA Wallet Storage
      </Typography>
      <Typography sx={{ mb: 4, color: '#8f9bb3' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Typography>
      <Button variant="contained" onClick={onClick}>
        Get Started
      </Button>
    </Box>
  );
};

export default Start;
