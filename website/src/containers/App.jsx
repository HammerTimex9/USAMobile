import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import CircularProgress from '@mui/material/CircularProgress';
import 'keen-slider/keen-slider.min.css';

import { useNetwork } from '../contexts/networkContext';
import Login from './login';
import Register from './register';
import ResetPassworod from './reset-password';
import OnBoadrding from './onboarding';
import NoSafari from './NoSafari';
import Main from '../components/App';
import './App.scss';

const PublicRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useMoralis();
  return (
    <Route
      {...rest}
      render={() => (isAuthenticated ? <Redirect to="/" /> : <Component />)}
    />
  );
};

const OnBoadrdingRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, user } = useMoralis();
  const { hasPolygon } = useNetwork();
  const hasMetamask = window.ethereum?.isMetaMask;
  const hasAddress = !!user?.get('ethAddress');
  const idString = navigator.userAgent;
  const isSafari =
    (idString.indexOf('Chrome') < 0) & (idString.indexOf('Safari') > 0);

  return (
    <Route
      {...rest}
      render={() =>
        isSafari ? (
          <NoSafari />
        ) : !isAuthenticated ? (
          <Redirect to="/login" />
        ) : hasMetamask && hasAddress && hasPolygon ? (
          <Redirect to="/" />
        ) : (
          <OnBoadrding />
        )
      }
    />
  );
};

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, user } = useMoralis();
  const { hasPolygon } = useNetwork();
  const hasMetamask = window.ethereum?.isMetaMask;
  const hasAddress = !!user?.get('ethAddress');

  return (
    <Route
      {...rest}
      render={() =>
        !isAuthenticated ? (
          <Redirect to="/login" />
        ) : !hasMetamask || !hasAddress || !hasPolygon ? (
          <Redirect to="/onboarding" />
        ) : (
          <Component />
        )
      }
    />
  );
};

const Routers = () => {
  const { isInitialized, isAuthenticated, user } = useMoralis();
  const hasMetamask = window.ethereum?.isMetaMask;
  const hasAddress = !!user?.get('ethAddress');
  const { hasPolygon } = useNetwork();

  if (
    !isInitialized ||
    (isAuthenticated && hasMetamask && hasAddress && hasPolygon === null)
  ) {
    return (
      <CircularProgress
        size={40}
        sx={{
          position: 'absolute',
          left: 'calc(50vw - 20px)',
          top: 'calc(50vh - 20px)',
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <Switch>
        <PublicRoute exact path="/login" component={Login} />
        <PublicRoute exact path="/register" component={Register} />
        <PublicRoute exact path="/reset-password" component={ResetPassworod} />
        <OnBoadrdingRoute exact path="/onboarding" />
        <PrivateRoute path="/" component={Main} />
      </Switch>
    </BrowserRouter>
  );
};

const App = () => {
  return <Routers />;
};

export default App;
