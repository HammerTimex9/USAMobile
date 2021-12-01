import { useEffect } from 'react';
import { Box } from '@mui/material';

import { useExperts } from '../../../contexts/expertsContext';
import NFTList from './NFTList';
import TokenList from './TokenList';

const Home = () => {
  const { setActionMode, setDialog } = useExperts();

  useEffect(() => {
    setActionMode('idle');
    setDialog(
      "Welcome to cryptocurrency, Citizen! Here are today's offerings."
    );
  }, [setActionMode, setDialog]);

  return (
    <Box>
      {false && <NFTList />}
      <TokenList />
    </Box>
  );
};

export default Home;
