import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from '@mui/system';

import AuthLayout from '../../components/layouts/AuthLayout';

const PasswordField = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  '.forgot': {
    marginTop: 15,
    textAlign: 'right',
    a: {
      color: 'inherit',
    },
  },
});

const Login = () => {
  const { isAuthenticating, authError, login } = useMoralis();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login(username.trim(), password, { usePost: true });
  };

  return (
    <AuthLayout title="Log In" error={authError?.message}>
      <TextField
        variant="standard"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <PasswordField>
        <TextField
          variant="standard"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="forgot">
          <Link to="/reset-password">Forgot Password?</Link>
        </div>
      </PasswordField>

      <LoadingButton
        variant="white-round"
        mt={5}
        onClick={handleLogin}
        disabled={!username.trim() || !password || isAuthenticating}
      >
        {isAuthenticating ? <CircularProgress size={20} /> : 'Log In'}
      </LoadingButton>

      <div className="footer">
        You don't have an account yet?
        <br />
        <Link to="/register">Register Here</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
