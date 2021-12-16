import React from 'react';
import { Box, Typography } from '@mui/material';
import './index.scss';

const YouWillGet = () => (
  <Box className="you-will-get">
    <label>To</label>
    <Box className="content">
      <Typography className="text">You will get</Typography>
    </Box>
  </Box>
);

export default YouWillGet;
