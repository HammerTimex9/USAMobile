import { useEffect } from 'react';
import { Box } from '@mui/material';

import { useExperts } from '../../../contexts/expertsContext';
import NFTList from './NFTList';
import TokenList from './TokenList';

const Home = () => {
  const { setExpert } = useExperts();

  useEffect(() => {
    setExpert({
      character: 'unclesam',
      dialog: "Welcome to cryptocurrency, Citizen! Here are today's offerings.",
    });
  }, [setExpert]);

  return (
    <Box sx={{ maxWidth: 768 }} px={1}>
      {false && <NFTList />}
      <TokenList />
    </Box>
  );
};

export default Home;
