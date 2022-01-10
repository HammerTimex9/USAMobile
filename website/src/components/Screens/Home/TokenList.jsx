import React from 'react';
import { Modal, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useKeenSlider } from 'keen-slider/react';

import tokenList from '../../../data/TokenList.json';
import { useExperts } from '../../../contexts/expertsContext';
import { usePositions } from '../../../contexts/portfolioContext';
import { Heading } from '../../UW/Heading';
import TokenCard from '../../Bits/TokenCard';

const Slider = styled('div')({
  width: '100%',
  maxWidth: 700,
  margin: '0 auto',
});

const Card = styled('div')(({ isPosition }) => ({
  display: 'flex',
  borderRadius: '25px',
  boxShadow: isPosition
    ? '0 0 0px 4px #efcc61, 6px 8px 10px rgba(0, 0, 0, 0.3)'
    : '4px 6px 10px rgba(0, 0, 0, 0.25)',
  cursor: 'pointer',

  '& p': {
    position: 'absolute',
    color: '#fff',
    lineHeight: 1,

    '&.name': {
      top: 18,
      left: 16,
      fontSize: 20,
    },

    '&.symbol': {
      top: 21,
      right: 18,
    },

    '&.value': {
      bottom: 18,
      left: 18,
      fontSize: 14,
    },

    '&.read-more': {
      bottom: 20,
      right: 18,
      fontSize: 14,
      textDecoration: 'underline',
    },
  },
}));

const TokenList = () => {
  const [selectedToken, setSelectedToken] = React.useState();
  const [centerIndex, setCenterIndex] = React.useState(0);
  const { positions } = usePositions();
  const { setDialog } = useExperts();
  const [sliderRef] = useKeenSlider({
    mode: 'free-snap',
    slides: {
      origin: 'center',
      perView: 2,
      spacing: 15,
    },
    slideChanged(s) {
      setCenterIndex(s.track.details.abs);
    },
  });

  const onCloseModal = () => setSelectedToken();

  React.useEffect(() => {
    setDialog(
      tokenList[centerIndex]?.shortDescription ||
        "Welcome to cryptocurrency, Citizen! Here are today's offerings."
    );
  }, [centerIndex, setDialog]);

  return (
    <>
      <Heading variant="h4" sx={{ my: 4 }}>
        Tokens
      </Heading>

      <Slider ref={sliderRef} className="keen-slider">
        {tokenList.map((token, i) => {
          const position = positions.find((p) => p.symbol === token.symbol);
          return (
            <Card
              className="keen-slider__slide"
              isPosition={!!position}
              onClick={() => setSelectedToken(token)}
            >
              <img
                src={`${process.env.PUBLIC_URL}/images/tokens/${token.symbol}.png`}
                width="100%"
                alt=""
                loading="lazy"
              />
              <Typography className="name">{token.name}</Typography>
              <Typography className="symbol">{token.symbol}</Typography>
              <Typography className="value">
                {position?.tokens.toPrecision(3)} {position?.symbol}
              </Typography>
              <Typography className="read-more">Read more</Typography>
            </Card>
          );
        })}
      </Slider>

      <Modal
        open={!!selectedToken}
        sx={{ maxWidth: '56rem', mx: 'auto', my: '3.56rem' }}
        onBackdropClick={onCloseModal}
      >
        <TokenCard symbol={selectedToken?.symbol} onClose={onCloseModal} />
      </Modal>
    </>
  );
};

export default TokenList;
