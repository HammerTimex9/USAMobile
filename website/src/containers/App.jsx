import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import CircularProgress from '@mui/material/CircularProgress';
import 'keen-slider/keen-slider.min.css';

import Login from './login';
import Register from './register';
import ResetPassworod from './reset-password';
import OnBoadrding from './onboarding';
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
  const { isAuthenticated, Moralis } = useMoralis();
  var isOnboarded = true;
  const user = Moralis?.User?.current();
  const ethAddress = user?.attributes?.ethAddress;
  // const hasMetamask = window.ethereum?.isMetaMask; //

  // New case , we discuss in Status, check only address, if don't have address, then move to onBoarding page
  if (!ethAddress) {
    isOnboarded = false;
  }

  //  if we don't have addres, but have metamask/polygon , what we should do that in that case.
  // if (!ethAddress) {
  //   if (hasMetamask) {
  //     // try {
  //     //   await window?.ethereum.request({
  //     //     method: 'wallet_switchEthereumChain',
  //     //     params: [{ chainId: '0x89' }],
  //     //   });
  //     //   return;
  //     // } catch (switchError) {
  //     //   console.log('Polygon is not added.');
  //     //   console.log('SwitchError:', switchError);
  //     // }
  //   }
  //   isOnboarded = false;
  // }

  // If we are checking first Metamask/Polygon and then address.

  // if (hasMetamask) {
  //   try {
  //     await window?.ethereum.request({
  //       method: 'wallet_switchEthereumChain',
  //       params: [{ chainId: '0x89' }],
  //     });
  //     if (ethAddress) {
  //       return;
  //     }
  //     console.log('User is not connected with MetaMask');
  //   } catch (switchError) {
  //     console.log('Polygon is not added.');
  //     console.log('SwitchError:', switchError);
  //   }
  //   isOnboarded = false;
  // } else {
  //   console.log('MetaMask is not Installed.');
  //   isOnboarded = false;
  // }

  // TODO: I am waiting from Thomas's help on this
  // to review with me and setup navigation.
  // May be need few changes on this about checks etc.

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          isOnboarded ? (
            <Component {...props} />
          ) : (
            <OnBoadrding {...props} />
          )
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

        {/*Commened this because need help on navigation from thomas.*/}
        {/*<PrivateRoute path="/onboarding" component={OnBoadrding} />*/}
        <PrivateRoute path="/" component={Main} />
      </Switch>
    </BrowserRouter>
  );
};

const App = () => {
  return <Routers />;
};

export default App;
