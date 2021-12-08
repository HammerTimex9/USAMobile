import React, { Suspense, lazy, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Stack, CircularProgress } from '@mui/material';

import { usePositions } from '../contexts/portfolioContext';
import { useNetwork } from '../contexts/networkContext';
import { useExperts } from '../contexts/expertsContext';
import { usePolygonNetwork } from '../hooks/usePolygonNetwork';

import Landing from './Screens/Landing';
import { TopNavBar } from './Screens/TopNavBar';
import { ExpertStage } from './Screens/ExpertStage';
import { NavBar } from './Screens/NavBar';
import { BottomFooter } from './Screens/BottomFooter';
import './App.scss';

const Home = lazy(() => import('./Screens/Home'));
const Portfolio = lazy(() => import('./Screens/Portfolio'));
const SwapTrade = lazy(() => import('./Screens/SwapTrade'));
const BuySell = lazy(() => import('./Screens/BuySell'));
const SendReceive = lazy(() => import('./Screens/SendReceive'));

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
  const { user } = useMoralis();
  const { isLoading, positions } = usePositions();
  const { isPolygon } = useNetwork();
  const { setDialog } = useExperts();
  const address = user?.attributes?.ethAddress;
  const hasMetamask = window.ethereum?.isMetaMask;

  const { getSelectedNetwork, switchNetworkToPolygon } = usePolygonNetwork();

  useEffect(() => {
    if (isAuthenticated) {
      if (isWeb3Enabled) {
        getSelectedNetwork();
      }
    } else {
      setDialog('Welcome to USA Wallet.  Simple, Safe, Secure.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    if (isAuthenticated && !isPolygon && hasMetamask) {
      switchNetworkToPolygon();
    }
  }, [hasMetamask, isAuthenticated, isPolygon, switchNetworkToPolygon]);

  const emptyPositions = !address || positions?.length === 0;

  return (
    <Stack alignItems="center" spacing={5} p={3}>
      <TopNavBar />
      <ExpertStage />
      {isAuthenticated ? (
        isLoading ? (
          <CircularProgress style={{ marginHeight: '160px' }} />
        ) : (
          <>
            <NavBar />
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
                  path="/SendRecieve"
                  component={SendReceive}
                  emptyPositions={emptyPositions}
                />
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

const App = () => {
  return (
    <Switch>
      <Route path="/landing">
        <Landing />
      </Route>
      <Route path="/">
        <Main />
      </Route>
    </Switch>
  );
};

export default App;
