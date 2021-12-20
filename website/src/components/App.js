import React, { Suspense, lazy, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Stack, CircularProgress } from '@mui/material';

import { useExperts } from '../contexts/expertsContext';
import { usePositions } from '../contexts/portfolioContext';
import { useNetwork } from '../contexts/networkContext';
import { usePolygonNetwork } from '../hooks/usePolygonNetwork';

import Landing from './Screens/Landing';
import Login from './Screens/Auth/Login';
import Register from './Screens/Auth/Register';

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
  const { user, isAuthenticated } = useMoralis();
  const { setExpert } = useExperts();
  const { isLoading, positions } = usePositions();
  const { isPolygon } = useNetwork();
  const address = user?.attributes?.ethAddress;
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
    if (isAuthenticated && !isPolygon && hasMetamask) {
      switchNetworkToPolygon();
    }
  }, [hasMetamask, isAuthenticated, isPolygon, switchNetworkToPolygon]);

  const emptyPositions = !address || positions?.length === 0;

  return (
    <Stack alignItems="center" spacing={5} p={3}>
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
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Route path="/">
        <Main />
      </Route>
    </Switch>
  );
};

export default App;
