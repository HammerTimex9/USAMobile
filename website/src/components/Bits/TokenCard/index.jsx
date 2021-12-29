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
  const { positions } = usePositions();
  const { network } = useNetwork();
  const token = tokenList.find((t) => t.symbol === symbol);
  const { value = 0, tokens } =
    positions.find((p) => p.symbol === symbol) || {};
  const { market_data, links } = data || {};

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
              {value > 0 && (
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
                    pathname: '/SendRecieve',
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
                  pathname: '/SendRecieve',
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
                ${market_data.current_price.usd}
              </Typography>
              <Typography className="title">
                {market_data.current_price.btc} BTC
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
                {market_data.price_change_percentage_1h_in_currency.usd}%
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
                {market_data.price_change_percentage_24h}%
              </Typography>
              <Typography
                className={
                  market_data.price_change_24h > 0
                    ? 'i-price'
                    : 'i-price negative'
                }
              >
                ${market_data.price_change_24h}
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
                {market_data.price_change_percentage_7d}%
              </Typography>
              <Typography
                className={
                  market_data.price_change_percentage_7d > 0
                    ? 'i-price'
                    : 'i-price negative'
                }
              >
                $
                {(market_data.current_price.usd *
                  market_data.price_change_percentage_7d) /
                  100}
              </Typography>
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
              <Typography className="title">Market Cap</Typography>
              <Typography fontSize="14px" className="price">
                ${market_data.market_cap.usd}
              </Typography>
              <Typography className="title">
                {market_data.market_cap.btc} BTC
              </Typography>
            </Box>
            <Box>
              <Typography className="title">24H Volume</Typography>
              <Typography className="title" fontSize="14px" opacity={1}>
                ${market_data.market_cap_change_24h}
              </Typography>
              <Typography className="title">
                {market_data.market_cap_change_24h_in_currency.btc} BTC
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
