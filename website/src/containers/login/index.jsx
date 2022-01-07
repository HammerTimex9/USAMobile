import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from '@mui/system';

import { validateEmail } from '../../utils/helper';
import AuthLayout from '../../components/layouts/AuthLayout';

const ForgotField = styled('div')({
  marginBottom: 40,
  textAlign: 'right',
});

const Login = () => {
  const { isAuthenticating, authError, login } = useMoralis();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const _email = email.trim();
  const disabled = !validateEmail(_email) || !password || isAuthenticating;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!disabled) {
      login(_email, password, { usePost: true });
    }
  };

  return (
    <AuthLayout
      title="Log In"
      error={authError?.message}
      onSubmit={handleLogin}
    >
      <TextField
        variant="standard"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 5 }}
      />
      <TextField
        variant="standard"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: '15px' }}
      />
      <ForgotField>
        <Link to="/reset-password">Forgot Password?</Link>
      </ForgotField>

      <LoadingButton
        variant="white-round"
        type="submit"
        disabled={disabled}
        sx={{ mb: 5 }}
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
