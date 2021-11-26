import React, { Suspense, lazy, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Stack } from '@mui/material';
import MetaMaskOnboarding from '@metamask/onboarding';

import { usePositions } from '../contexts/portfolioContext';
import { useNetwork } from '../contexts/networkContext';
import { useExperts } from '../contexts/expertsContext';
import { usePolygonNetwork } from '../hooks/usePolygonNetwork';

import { TopNavBar } from './Screens/TopNavBar';
import { ExpertStage } from './Screens/ExpertStage';
import { NavBar } from './Screens/NavBar';
import { BottomFooter } from './Screens/BottomFooter';
import './App.scss';

const PortfolioPrices = lazy(() => import('./Screens/PortfolioPrices'));
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

function App() {
  const { isAuthenticated, Moralis, enableWeb3, isWeb3Enabled } = useMoralis();
  const { user } = useMoralis();
  const { positions } = usePositions();
  const { setNetworkId, isPolygon } = useNetwork();
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

  useEffect(() => {
    const initMoralisEvents = () => {
      Moralis.onAccountsChanged((accounts) => {
        console.log('Account Changed Called.', accounts);
        Moralis.link(accounts[0]);
      });
      Moralis.onChainChanged((chainId) => {
        console.log('ChainId:', chainId);
        setNetworkId(parseInt(chainId));
      });
    };

    if (isAuthenticated) {
      initMoralisEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Moralis, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      if (!isWeb3Enabled) {
        enableWeb3();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled, enableWeb3]);

  const emptyPositions = !address || positions.length === 0;
  const isOnlyMatic = positions.length === 1 && positions[0].symbol === 'MATIC';

  return (
    <Stack alignItems="center" spacing={5} p={3}>
      <TopNavBar />
      <ExpertStage />
      {isAuthenticated && isPolygon ? (
        <>
          <NavBar />
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <CryptoRoute
                exact
                path="/PortfolioPrices"
                component={PortfolioPrices}
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
              <Redirect to={isOnlyMatic ? '/SwapTrade' : '/PortfolioPrices'} />
            </Switch>
          </Suspense>
        </>
      ) : (
        <BottomFooter />
      )}
    </Stack>
  );
}

export default App;
