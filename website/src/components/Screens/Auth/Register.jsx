import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useMoralis } from 'react-moralis';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './styles.css';
import { Heading } from '../../UW/Heading';
import { Text } from '../../UW/Text';
import { ReactComponent as LogoSvg } from '../../../media/logos/logo-usawallet.svg';

const Register = () => {
  const history = useHistory();
  const { authenticate, isAuthenticating, authError, isAuthenticated, signup } =
    useMoralis();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/');
    }
  }, [history, isAuthenticated]);

  const handleSignUp = () => {
    signup(userName ? userName : email, password, email, { usePost: true });
  };

  const handleAuthenticate = () => {
    authenticate({ usePost: true });
  };

  return (
    <Container className="auth-dark-bg" sx={{ minHeight: '100vh' }}>
      <IconButton
        variant="uw"
        className="authHomeButton"
        to="/"
        component={RouterLink}
      >
        <HomeIcon />
      </IconButton>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <Box
          component="div"
          sx={{
            width: 320,
            textAlign: 'center',
            mt: 8,
          }}
        >
          <LogoSvg width="320" height="65" />
          <Heading
            variant="h4"
            sx={{ mt: 3, fontSize: '1.5rem', color: 'white' }}
          >
            Register
          </Heading>
        </Box>
        <Box
          component="form"
          sx={{
            width: 320,
          }}
        >
          <Stack
            sx={{
              borderWidth: 5,
              borderRadius: '.375rem',
              px: 2,
            }}
          >
            {authError != null && (
              <Alert severity="warning">{authError.message}</Alert>
            )}

            <Tooltip title="Enter desired USA Wallet user name.">
              <TextField
                label="User Name"
                type="text"
                variant="standard"
                autoComplete="username"
                value={userName}
                InputLabelProps={{
                  className: 'authInputLabel',
                }}
                InputProps={{
                  className: 'authInput',
                }}
                onChange={(event) => setUserName(event.currentTarget.value)}
              />
            </Tooltip>
            <Tooltip title="Enter email where you wish to recieve notifications.">
              <TextField
                sx={{ mt: 4 }}
                className={isAuthenticated ? 'email verified' : 'email'}
                label="E-mail"
                type="email"
                variant="standard"
                autoComplete="email"
                value={email}
                InputLabelProps={{
                  className: 'authInputLabel',
                }}
                InputProps={{
                  className: 'authInput',
                }}
                onChange={(event) => setEmail(event.currentTarget.value)}
              />
            </Tooltip>
            <Tooltip title="Enter a password.">
              <TextField
                sx={{ mt: 4 }}
                label="Password"
                type="password"
                variant="standard"
                autoComplete="password"
                value={password}
                InputLabelProps={{
                  className: 'authInputLabel',
                }}
                InputProps={{
                  className: 'authInput',
                }}
                onChange={(event) => setPassword(event.currentTarget.value)}
              />
            </Tooltip>
            <>
              <Tooltip title="Log into USA Wallet with your e-mail and password.">
                <Button
                  sx={{
                    mt: 5,
                    mb: 2,
                    backgroundColor: 'white',
                    fontSize: '1.25rem',
                    border: 'none',
                  }}
                  variant="outlined"
                  onClick={handleSignUp}
                >
                  Register
                </Button>
              </Tooltip>
              <Tooltip title="Use Metamask to authenticate into your USA Wallet account.">
                <LoadingButton
                  sx={{
                    mb: 2,
                    backgroundColor: 'white',
                    fontSize: '1.25rem',
                    border: 'none',
                  }}
                  variant="outlined"
                  loading={isAuthenticating}
                  onClick={handleAuthenticate}
                >
                  Use MetaMask
                </LoadingButton>
              </Tooltip>
            </>
          </Stack>
        </Box>
        <Box
          component="div"
          sx={{
            width: 320,
            textAlign: 'center',
          }}
        >
          <Text
            sx={{
              pb: 0.5,
              fontSize: '18px',
              fontFamily: 'Roboto',
              color: 'white',
            }}
          >
            You already have an account?
          </Text>
          <Button
            sx={{
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              boxShadow: 'none',
              fontSize: '1rem',
              height: 20,
              color: 'white',
              textDecoration: 'underline',
              fontWeight: 700,
            }}
            component={RouterLink}
            to="/login"
          >
            Log In Here
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default Register;
