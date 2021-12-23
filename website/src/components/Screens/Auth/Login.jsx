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

const Login = () => {
  const history = useHistory();
  const { authenticate, isAuthenticating, authError, isAuthenticated, login } =
    useMoralis();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/');
    }
  }, [history, isAuthenticated]);

  const handleLogIn = () => {
    login(email, password === '' ? undefined : password, {
      usePost: true,
    });
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
        sx={{ background: 'var(--fade-out-bg)' }}
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
            sx={{ mt: 3, fontSize: '1.5rem', color: 'var(--color-white)' }}
          >
            Login
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

            <Tooltip title="Enter USA Wallet user name.">
              <TextField
                label="User Name"
                type="text"
                variant="standard"
                autoComplete="username"
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
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-white)',
                    boxShadow: 'var(--box-shadow-inset)',
                    fontSize: '1.25rem',
                    border: 'none',
                    minHeight: '3rem',
                  }}
                  variant="uw-solid"
                  onClick={handleLogIn}
                >
                  Log In
                </Button>
              </Tooltip>
              <Tooltip title="Use Metamask to authenticate into your USA Wallet account.">
                <LoadingButton
                  sx={{
                    mb: 2,
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-white)',
                    boxShadow: 'var(--box-shadow-inset)',
                    fontSize: '1.25rem',
                    border: 'none',
                    minHeight: '3rem',
                  }}
                  variant="uw-solid"
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
              fontFamily: 'var(--font-family)',
              color: 'var(--color-white)',
            }}
          >
            You don’t have an account yet?
          </Text>
          <Button
            sx={{
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              boxShadow: 'none',
              fontSize: '1rem',
              height: 20,
              color: 'var(--color-white)',
              textDecoration: 'underline',
              fontWeight: 700,
            }}
            component={RouterLink}
            to="/register"
          >
            Register Here
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
