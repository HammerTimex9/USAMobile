import { useEffect } from 'react';
import { Container } from '@mui/material';

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
    <Container maxWidth="lg" px={1}>
      {false && <NFTList />}
      <TokenList />
    </Container>
  );
};

export default Home;
