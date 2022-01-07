import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import CircularProgress from '@mui/material/CircularProgress';

import Login from './login';
import Register from './register';
import ResetPassworod from './reset-password';
import CryptoLogin from './crypto-login';
import Main from '../components/App';
import './App.scss';

const PublicRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useMoralis();
  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={(props.location.state || {}).from || '/'} />
        )
      }
    />
  );
};

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useMoralis();

  // Just to Debug and We can use to setup Route later
  // const { Moralis } = useMoralis();
  // const user = Moralis.User.current();
  // console.log('user:', user);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{ pathname: '/login', state: { from: props.location } }}
          />
        )
      }
    />
  );
};

const Routers = () => {
  const { isInitialized } = useMoralis();

  if (!isInitialized) {
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
        <PublicRoute path="/crypto-login" component={CryptoLogin} />
        <PrivateRoute path="/" component={Main} />
      </Switch>
    </BrowserRouter>
  );
};

const App = () => {
  return <Routers />;
};

export default App;
