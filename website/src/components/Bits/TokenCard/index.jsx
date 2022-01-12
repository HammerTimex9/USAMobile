import React from 'react';
import { Link } from 'react-router-dom';
import { Stack, Box, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TradingViewWidget from 'react-tradingview-widget';
import useTokenInfo from '../../../actions/useTokenInfo';
import LoadIcon from '../../../media/load.gif';
import { useNetwork } from '../../../contexts/networkContext';
import { usePositions } from '../../../contexts/portfolioContext';
import tokenList from '../../../data/TokenList.json';
import './styles.scss';

const TokenCard = ({ symbol, onClose }, ref) => {
  const { data } = useTokenInfo(symbol);
  const { positions, totalValue } = usePositions();
  const { network } = useNetwork();
  const token = tokenList.find((t) => t.symbol === symbol);
  const { value = 0, tokens } =
    positions.find((p) => p.symbol === symbol) || {};
  const { market_data, links } = data || {};
  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
  };
  const abbreviateNumber = (value) => {
    let newValue = value;
    if (value >= 1000) {
      let suffixes = ['', 'K', 'M', 'B', 'T'];
      let suffixNum = Math.floor(('' + value).length / 3);
      let shortValue = '';
      for (let precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat(
          (suffixNum !== 0
            ? value / Math.pow(1000, suffixNum)
            : value
          ).toPrecision(3)
        );
        let dotLessShortValue = (shortValue + '').replace(
          /[^a-zA-Z 0-9]+/g,
          ''
        );
        if (dotLessShortValue.length <= 2) {
          break;
        }
      }
      if (shortValue % 1 !== 0) shortValue = shortValue.toPrecision(3);
      newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
  };
  const abbreviateNumber1 = (v) => {
    let pre = '',
      value = v,
      last;
    if (v < 0) {
      // pre = '-';
    }
    value = Number((Math.abs(v) + '').split('.')[0]);
    last =
      value > 1000
        ? ''
        : '.' + (Math.abs(v) + '').split('.')[1].substring(0, 3);
    let newValue = value;
    if (value >= 1000) {
      let suffixes = ['', 'K', 'M', 'B', 'T'];
      let suffixNum = Math.floor(('' + value).length / 3);
      let shortValue = '';
      for (let precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat(
          (suffixNum !== 0
            ? value / Math.pow(1000, suffixNum)
            : value
          ).toPrecision(3)
        );
        let dotLessShortValue = (shortValue + '').replace(
          /[^a-zA-Z 0-9]+/g,
          ''
        );
        if (dotLessShortValue.length <= 2) {
          break;
        }
      }
      if (shortValue % 1 !== 0) shortValue = shortValue.toPrecision(3);
      newValue = shortValue + suffixes[suffixNum];
    }
    return pre + newValue + last;
  };
  return (
    <Box ref={ref} className="token-card">
      {data ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3.75,
            }}
          >
            <Box sx={{ display: 'flex' }}>
              <Box
                component="img"
                sx={{ height: 70, width: 70 }}
                src={token?.image}
              />
              <Box className="header-title">
                <Typography>{data.name}</Typography>
                <Typography>Currency</Typography>
              </Box>
            </Box>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                mx: 3,
                '& a': {
                  color: 'inherit',
                  textDecoration: 'none',
                },
              }}
            >
              {totalValue > 0 && (
                <Link
                  to={{
                    pathname: '/SwapTrade',
                    state: { toSymbol: symbol },
                  }}
                >
                  <Button>Buy</Button>
                </Link>
              )}
              {symbol === 'USDC' && (
                <Link to="/BuySell">
                  <Button>Buy with Fiat</Button>
                </Link>
              )}
              {value > 0 && (
                <Link
                  to={{
                    pathname: '/SwapTrade',
                    state: { fromSymbol: symbol, amount: tokens },
                  }}
                >
                  <Button>Sell</Button>
                </Link>
              )}
              {value > 0 && (
                <Link
                  to={{
                    pathname: '/SendReceive',
                    state: {
                      mode: 'send',
                      fromSymbol: symbol,
                      amount: tokens * 0.1,
                    },
                  }}
                >
                  <Button>Send</Button>
                </Link>
              )}
              <Link
                to={{
                  pathname: '/SendReceive',
                  state: { mode: 'receive' },
                }}
              >
                <Button>Receive</Button>
              </Link>
            </Stack>
            <Box sx={{ position: 'absolute', right: '10px', top: '15px' }}>
              <IconButton onClick={onClose}>
                <CloseIcon color="primary" />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mt: 3.75,
            }}
          >
            <Box>
              <Typography className="title">Market Price</Typography>
              <Typography className="price">
                ${abbreviateNumber(market_data.current_price.usd)}
              </Typography>
              <Typography className="title">
                {market_data.current_price.btc.toFixed(3)} BTC
              </Typography>
            </Box>
            <Box>
              <Typography className="title">1H Change</Typography>
              <Typography
                className={
                  market_data.price_change_percentage_1h_in_currency.usd > 0
                    ? 'percent'
                    : 'percent negative'
                }
              >
                {market_data.price_change_percentage_1h_in_currency.usd.toPrecision(
                  3
                )}
                %
              </Typography>
              <Typography
                className={
                  market_data.price_change_percentage_1h_in_currency > 0
                    ? 'i-price'
                    : 'i-price negative'
                }
              >
                $
                {(
                  (market_data.current_price.usd *
                    market_data.price_change_percentage_1h_in_currency.usd) /
                  100
                ).toFixed(3)}
              </Typography>
            </Box>
            <Box>
              <Typography className="title">24H Change</Typography>
              <Typography
                className={
                  market_data.price_change_percentage_24h > 0
                    ? 'percent'
                    : 'percent negative'
                }
              >
                {market_data.price_change_percentage_24h.toPrecision(3)}%
              </Typography>
              <Typography
                className={
                  market_data.price_change_24h > 0
                    ? 'i-price'
                    : 'i-price negative'
                }
              >
                ${numberWithCommas(market_data.price_change_24h.toFixed(3))}
              </Typography>
            </Box>
            <Box>
              <Typography className="title">7D Change</Typography>
              <Typography
                className={
                  market_data.price_change_percentage_7d > 0
                    ? 'percent'
                    : 'percent negative'
                }
              >
                {market_data.price_change_percentage_7d.toPrecision(3)}%
              </Typography>
              <Typography
                className={
                  market_data.price_change_percentage_7d > 0
                    ? 'i-price'
                    : 'i-price negative'
                }
              >
                $
                {numberWithCommas(
                  (
                    (market_data.current_price.usd *
                      market_data.price_change_percentage_7d) /
                    100
                  ).toFixed(3)
                )}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              mt: 3.75,
            }}
          >
            <Box sx={{ position: 'absolute', left: 32 }}>
              <Typography className="title">Market Cap</Typography>
              <Typography fontSize="14px" className="price">
                ${abbreviateNumber(market_data.market_cap.usd)}
              </Typography>
              <Typography className="title">
                {abbreviateNumber(market_data.market_cap.btc)} BTC
              </Typography>
            </Box>
            <img
              src={`${process.env.PUBLIC_URL}/images/tokens/${symbol}.png`}
              alt=""
              loading="lazy"
              style={{ borderRadius: 2 }}
            />
            <Box sx={{ position: 'absolute', right: 32 }}>
              <Typography className="title">24H Volume</Typography>
              <Typography className="title" fontSize="14px" opacity={1}>
                ${abbreviateNumber1(market_data.market_cap_change_24h)}
              </Typography>
              <Typography className="title">
                {abbreviateNumber1(
                  market_data.market_cap_change_24h_in_currency.btc
                )}
                BTC
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 1.75 }}>
            <Typography fontSize="17px" fontWeight="500" color="#000">
              Simple Description
            </Typography>
            <Typography className="description" fontSize="14px">
              {token?.description}
            </Typography>
          </Box>
          <Box className="trading-view">
            <TradingViewWidget symbol={`${data.symbol}USD`} autosize />
          </Box>
          <Box sx={{ mt: 1.75 }}>
            <Typography fontSize="17px" fontWeight="500" color="#000">
              Details
            </Typography>
            <Typography className="description" fontSize="14px">
              {token?.details}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mt: 3.75,
            }}
            className="button-wrap"
          >
            {links.blockchain_site
              .filter(
                (a, index) =>
                  a &&
                  a.indexOf(network.name ? network.name : 'polygonscan') > -1
              )
              .map((b, index) => (
                <a
                  key={index}
                  href={b}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Button
                    variant="darkblue"
                    size={links.blockchain_site.length > 5 ? 'small' : 'medium'}
                    className="link-button"
                  >
                    {b.split('/')[2].split('.')[0]}
                  </Button>
                </a>
              ))}
          </Box>
        </>
      ) : (
        <img className="loading" src={LoadIcon} alt="" />
      )}
    </Box>
  );
};

export default React.forwardRef(TokenCard);
