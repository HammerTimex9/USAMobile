import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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
  const [passwordVisible, setPasswordVisible] = useState('false');
  const _email = email.trim();
  const disabled = !validateEmail(_email) || !password || isAuthenticating;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!disabled) {
      login(_email, password, { usePost: true });
    }
  };

  const handleToggleVisiblity = (e) => {
    e.preventDefault();
    setPasswordVisible(!passwordVisible);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
        autoComplete="current-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 5 }}
      />
      <TextField
        variant="standard"
        label="Password"
        type={passwordVisible === true ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: '15px' }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleToggleVisiblity}
                onMouseDown={handleMouseDownPassword}
              >
                {passwordVisible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
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
