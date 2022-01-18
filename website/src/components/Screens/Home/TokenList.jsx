import React from 'react';
import { Modal, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { useKeenSlider } from 'keen-slider/react';

import tokenList from '../../../data/TokenList.json';
import { useExperts } from '../../../contexts/expertsContext';
import { usePositions } from '../../../contexts/portfolioContext';
import { Heading } from '../../UW/Heading';
import TokenCard from '../../Bits/TokenCard';

const Slider = styled('div')({
  alignItems: 'center',
  width: '100%',
  maxWidth: 700,
  margin: '0 auto',

  '.keen-slider__slide': { padding: '20px 8px' },
});

const Button = styled(IconButton)({
  color: 'var(--color)',
});

const Card = styled(Box)(({ isPosition }) => ({
  position: 'relative',
  display: 'flex',
  borderRadius: '25px',
  boxShadow: isPosition
    ? '0 0 0px 4px #efcc61, 6px 8px 10px rgba(0, 0, 0, 0.3)'
    : '4px 6px 10px rgba(0, 0, 0, 0.25)',
  cursor: 'pointer',
  overflow: 'hidden',

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

const ResizePlugin = (slider) => {
  const observer = new ResizeObserver(function () {
    const height = ((slider.container.clientWidth / 2 - 16) / 280) * 172 + 40;
    slider.container.style.height = `${height}px`;
    slider.update();
  });
  slider.on('created', () => {
    observer.observe(slider.container);
  });
  slider.on('destroyed', () => {
    observer.unobserve(slider.container);
  });
};

const TokenList = () => {
  const [selectedToken, setSelectedToken] = React.useState();
  const [centerIndex, setCenterIndex] = React.useState(0);
  const { positions } = usePositions();
  const { setDialog } = useExperts();
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      mode: 'free-snap',
      slides: {
        origin: 'center',
        perView: 2,
      },
      slideChanged(s) {
        setCenterIndex(s.track.details.abs);
      },
    },
    [ResizePlugin]
  );

  const onCloseModal = () => setSelectedToken();

  React.useEffect(() => {
    setDialog(
      tokenList[centerIndex]?.shortDescription ||
        "Welcome to cryptocurrency, Citizen! Here are today's offerings."
    );
  }, [centerIndex, setDialog]);

  return (
    <>
      <Heading variant="h4" sx={{ mt: 4, mb: 2 }}>
        Tokens
      </Heading>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Button
          onClick={(e) => e.stopPropagation() || instanceRef.current?.prev()}
        >
          <ArrowBackIosNewIcon />
        </Button>
        <Slider ref={sliderRef} className="keen-slider">
          {tokenList.map((token, i) => {
            const position = positions.find((p) => p.symbol === token.symbol);
            return (
              <div key={`key-token-card-${i}`} className="keen-slider__slide">
                <Card
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
              </div>
            );
          })}
        </Slider>
        <Button
          className="forward-btn"
          onClick={(e) => e.stopPropagation() || instanceRef.current?.next()}
        >
          <ArrowForwardIosIcon />
        </Button>
      </Stack>

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
