import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';

import { validateEmail } from '../../utils/helper';
import AuthLayout from '../../components/layouts/AuthLayout';

const Register = () => {
  const { isAuthenticating, authError, signup } = useMoralis();
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState('false');
  const [passwordCopy, setPasswordCopy] = useState('');
  const [passMatchError, setPassMatchError] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [email, setEmail] = useState('');
  const _email = email.trim();
  const disabled = !validateEmail(_email) || !password || isAuthenticating;

  useEffect(() => {
    console.log('passMatchError: ', passMatchError);
    console.log('authError:', authError);
    let errorMessage = '';
    if (passMatchError.length > 3) {
      errorMessage = passMatchError + ' ';
    }
    if (authError?.message !== undefined) {
      errorMessage = errorMessage + authError.message;
    }
    setErrMsg(errorMessage);
  }, [authError, passMatchError]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!disabled) {
      if (passwordCopy) {
        if (password === passwordCopy) {
          signup(_email, password, _email, { usePost: true });
        } else {
          setPassMatchError('Passwords do not match.');
        }
      } else {
        setPassMatchError('Please confirm your password.');
      }
    }
  };

  const handleToggleVisiblity = (e) => {
    e.preventDefault();
    setPasswordVisible(!passwordVisible);
  };

  return (
    <AuthLayout title="Register" error={errMsg} onSubmit={handleRegister}>
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
        sx={{ mb: '40px' }}
      />
      <TextField
        variant="standard"
        label="Confirm Password"
        type="password"
        autoComplete="current-password"
        value={passwordCopy}
        onChange={(e) => setPasswordCopy(e.target.value)}
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
