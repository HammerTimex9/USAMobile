import { useEffect } from 'react';
import { Box } from '@mui/material';

import { useExperts } from '../../../contexts/expertsContext';
import NFTList from './NFTList';
import TokenList from './TokenList';

const Home = () => {
  const { setCharacter, setDialog } = useExperts();

  useEffect(() => {
    setCharacter('unclesam');
    setDialog(
      "Welcome to cryptocurrency, Citizen! Here are today's offerings."
    );
  }, [setCharacter, setDialog]);

  return (
    <Box>
      {false && <NFTList />}
      <TokenList />
    </Box>
  );
};

export default Home;
