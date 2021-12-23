import React from 'react';
import { useMoralis } from 'react-moralis';
import { Box, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';

import { Heading } from '../../UW/Heading';

const mockData = [
  {
    token_id: '1',
    token_uri: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    name: 'Breakfast',
  },
  {
    token_id: '2',
    token_uri: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    name: 'Burger',
  },
  {
    token_id: '3',
    token_uri: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    name: 'Camera',
  },
  {
    token_id: '4',
    token_uri: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    name: 'Coffee',
  },
  {
    token_id: '5',
    token_uri: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    name: 'Hats',
  },
  {
    token_id: '6',
    token_uri: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    name: 'Honey',
  },
  {
    token_id: '7',
    token_uri: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    name: 'Basketball',
  },
  {
    token_id: '8',
    token_uri: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    name: 'Fern',
  },
];

const NFTList = () => {
  const { Moralis } = useMoralis();
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    Moralis.Web3API.account.getNFTs({ chain: 'ropsten' }).then((data) => {
      setItems(data.result);
      setItems(mockData);
    });
  }, [Moralis]);

  return (
    items.length > 0 && (
      <>
        <Heading variant="h4">NFT List</Heading>
        <Box
          sx={{
            width: 600,
            borderRadius: '1.5rem',
            backgroundImage: 'var(--bg)', // unconfirmed
            border: '4px solid var(--border-color)',
            overflow: 'hidden',
            mx: 'auto',
            my: 2,
          }}
        >
          <ImageList sx={{ height: 450, m: 0 }} className="uw-scrollbar">
            {items.map((item, i) => (
              <ImageListItem key={item.token_id}>
                <img src={`${item.token_uri}`} alt="" loading="lazy" />
                <ImageListItemBar title={item.name} />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </>
    )
  );
};

export default NFTList;
