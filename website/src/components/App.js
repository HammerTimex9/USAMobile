import React, { Suspense, lazy, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Stack, CircularProgress } from '@mui/material';

import { useExperts } from '../contexts/expertsContext';
import { usePositions } from '../contexts/portfolioContext';
import { useNetwork } from '../contexts/networkContext';
import { usePolygonNetwork } from '../hooks/usePolygonNetwork';

import { TopNavBar } from './Screens/TopNavBar';
import { ExpertStage } from './Screens/ExpertStage';
import { NavBar } from './Screens/NavBar';
import { BottomFooter } from './Screens/BottomFooter';

const Home = lazy(() => import('./Screens/Home'));
const Portfolio = lazy(() => import('./Screens/Portfolio'));
const SwapTrade = lazy(() => import('./Screens/SwapTrade'));
const BuySell = lazy(() => import('./Screens/Transak'));
// Does not actually sell Matic for USD:
// const BuySell = lazy(() => import('./Screens/OnRamper'));
const SendReceive = lazy(() => import('./Screens/SendReceive'));
const NoSafari = lazy(() => import('../containers/NoSafari'));

const CryptoRoute = ({ component: Component, emptyPositions, ...rest }) => {
  return (
    <Route
      {...rest}
      render={() =>
        emptyPositions ? <Redirect to="/BuySell" /> : <Component />
      }
    />
  );
};

const Main = () => {
  const { isAuthenticated, isWeb3Enabled } = useMoralis();
  const { setExpert } = useExperts();
  const { isLoading } = usePositions();
  const { isPolygon } = useNetwork();
  const hasMetamask = window.ethereum?.isMetaMask;

  const { switchNetworkToPolygon } = usePolygonNetwork();

  useEffect(() => {
    if (!isAuthenticated) {
      setExpert({
        character: 'unclesam',
        dialog: 'Welcome to money by, of, and for the people.',
      });
    }
  }, [isAuthenticated, setExpert]);

  useEffect(() => {
    // To Debug OnBaording Issue
    // console.groupCollapsed('AppUseEffect:');
    // console.log('hasMetamask:', hasMetamask);
    // console.log('isPolygon:', isPolygon);
    // console.log('isAuthenticated:', isAuthenticated);
    // console.groupEnd();

    if (isAuthenticated && !isPolygon && hasMetamask && isWeb3Enabled) {
      switchNetworkToPolygon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMetamask, isAuthenticated, isPolygon]);

  const emptyPositions = false; //!address || positions?.length === 0;

  return (
    <Stack alignItems="center" spacing={3} py={3}>
      <TopNavBar />
      {isAuthenticated && !isLoading ? <NavBar /> : null}
      <ExpertStage />
      {isAuthenticated ? (
        isLoading ? (
          <CircularProgress style={{ marginHeight: '160px' }} />
        ) : (
          <>
            <Suspense
              fallback={<CircularProgress style={{ marginHeight: '40px' }} />}
            >
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <CryptoRoute
                  exact
                  path="/Portfolio"
                  component={Portfolio}
                  emptyPositions={emptyPositions}
                />
                <CryptoRoute
                  exact
                  path="/SwapTrade"
                  component={SwapTrade}
                  emptyPositions={emptyPositions}
                />
                <Route exact path="/BuySell">
                  <BuySell />
                </Route>
                <CryptoRoute
                  exact
                  path="/SendReceive"
                  component={SendReceive}
                  emptyPositions={emptyPositions}
                />
                <Route exact path="/NoSafari">
                  <NoSafari />
                </Route>
                <Redirect to="/" />
              </Switch>
            </Suspense>
          </>
        )
      ) : (
        <BottomFooter />
      )}
    </Stack>
  );
};

export default Main;
