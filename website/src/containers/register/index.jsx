import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';

import { validateEmail } from '../../utils/helper';
import AuthLayout from '../../components/layouts/AuthLayout';

const Register = () => {
  const { isAuthenticating, authError, signup } = useMoralis();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const _email = email.trim();
  const disabled = !validateEmail(_email) || !password || isAuthenticating;

  const handleRegister = (e) => {
    e.preventDefault();
    if (!disabled) {
      signup(_email, password, _email, { usePost: true });
    }
  };

  return (
    <AuthLayout
      title="Register"
      error={authError?.message}
      onSubmit={handleRegister}
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
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: '74px' }}
      />
      <TextField
        variant="standard"
        label="Confirm Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: '74px' }}
      />

      <LoadingButton
        variant="white-round"
        type="submit"
        disabled={disabled}
        sx={{ mb: 5 }}
      >
        {isAuthenticating ? <CircularProgress size={20} /> : 'Register'}
      </LoadingButton>

      <div className="footer">
        You already have an account?
        <br />
        <Link to="/login">Log In Here</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
