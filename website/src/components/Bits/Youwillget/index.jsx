import React from 'react';
import { Box, Typography } from '@mui/material';
import './index.scss';

const YouWillGet = ({ value }) => (
  <Box className="you-will-get">
    <Box className="content">
      <Typography className="text">
        You will get {value ? value : ''}
      </Typography>
    </Box>
  </Box>
);

export default YouWillGet;
