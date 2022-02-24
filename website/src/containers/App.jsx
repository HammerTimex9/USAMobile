import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import CircularProgress from '@mui/material/CircularProgress';
import 'keen-slider/keen-slider.min.css';

import { useNetwork } from '../contexts/networkContext';
import Login from './login';
import Register from './register';
import ResetPassworod from './reset-password';
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

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useMoralis();
  const idString = navigator.userAgent;
  const isSafari =
    (idString.indexOf('Chrome') < 0) & (idString.indexOf('Safari') > 0);

  // console.groupCollapsed('Apps.jsx::PrivateRoute()');
  // console.log('isAuthenticated:', isAuthenticated);
  // console.log('isSafari:', isSafari);
  // console.groupEnd();

  return (
    <Route
      {...rest}
      render={() =>
        isSafari ? (
          <Redirect to="/nosafari" />
        ) : !isAuthenticated ? (
          <Redirect to="/register" />
        ) : (
          <Component />
        )
      }
    />
  );
};

const Routers = () => {
  const { isInitialized, isAuthenticated } = useMoralis();
  const hasMetaMask = window.ethereum?.isMetaMask;
  const { hasPolygon } = useNetwork();

  // console.groupCollapsed('App.jsx::Routers()');
  // console.log('isInitialized:', isInitialized);
  // console.log('isAuthenticated:', isAuthenticated);
  // console.log('hasMetaMask:', hasMetaMask);
  // console.log('hasPolygon:', hasPolygon);
  // console.groupEnd();

  if (
    !isInitialized ||
    (isAuthenticated && hasMetaMask && hasPolygon === null)
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
        <PublicRoute exact path="/nosafari" component={NoSafari} />
        <PrivateRoute path="/" component={Main} />
      </Switch>
    </BrowserRouter>
  );
};

const App = () => {
  return <Routers />;
};

export default App;
