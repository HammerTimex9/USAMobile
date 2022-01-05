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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    const _email = email.trim();
    if (_email && !validateEmail(_email)) {
      setError('Please use a valid email address.');
      return;
    }

    setError();
    signup(username.trim(), password, _email, { usePost: true });
  };

  return (
    <AuthLayout title="Register" error={authError?.message || error}>
      <TextField
        variant="standard"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        variant="standard"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <LoadingButton
        variant="white-round"
        mt={5}
        onClick={handleRegister}
        disabled={!username.trim() || !password || isAuthenticating}
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
