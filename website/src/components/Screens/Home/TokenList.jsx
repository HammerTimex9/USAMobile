import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Modal,
} from '@mui/material';

import { Heading } from '../../UW/Heading';
import tokenList from '../../../data/TokenList.json';
import TokenCard from '../../Bits/TokenCard';

const TokenList = () => {
  const [selectedSymbol, setSelectedSymbol] = React.useState(null);
  const [description, setDescription] = React.useState(null);

  const onCloseModal = () => setSelectedSymbol();

  return (
    <>
      <Heading variant="h4">Token List</Heading>
      <Box
        sx={{
          width: 500,
          mx: 'auto',
          borderRadius: '1.5rem',
          backgroundImage: 'var(--bg)',
          border: '4px solid var(--borderColor)',
          overflow: 'hidden',
        }}
      >
        <List
          sx={{
            maxHeight: 288,
            overflow: 'auto',
          }}
          className="uw-scrollbar"
        >
          {tokenList.map((token) => (
            <ListItemButton
              key={token.symbol}
              onClick={() => {
                setSelectedSymbol(token.symbol);
                setDescription(token.description);
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={token.image}
                  size="sm"
                  sx={{ backgroundColor: '#fff' }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={token.name}
                secondary={token.description}
              />
            </ListItemButton>
          ))}
        </List>
        <Modal
          open={!!selectedSymbol}
          sx={{ maxWidth: '56rem', mx: 'auto', my: '3.56rem' }}
          onBackdropClick={onCloseModal}
        >
          <TokenCard
            description={description}
            symbol={selectedSymbol}
            onClose={onCloseModal}
          />
        </Modal>
      </Box>
    </>
  );
};

export default TokenList;
