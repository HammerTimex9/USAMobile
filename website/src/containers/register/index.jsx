import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
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
    let errorMessage = '';
    if (passMatchError.length > 3) {
      errorMessage = passMatchError + ' ';
    }
    if (authError?.message !== undefined) {
      errorMessage = errorMessage + authError.message;
    }
    setErrMsg(errorMessage);
    console.log('passwordVisible:', passwordVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authError, passMatchError]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!disabled) {
      if (password === passwordCopy) {
        signup(_email, password, _email, { usePost: true });
      } else {
        setPassMatchError('Passwords do not match.');
      }
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
    <AuthLayout title="Register" error={errMsg} onSubmit={handleRegister}>
      <TextField
        variant="standard"
        label="Email"
        type="email"
        autoComplete="email"
        required={true}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 5 }}
      />

      <TextField
        variant="standard"
        label="Password"
        type={passwordVisible === true ? 'text' : 'password'}
        autoComplete="new-password"
        required={true}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        sx={{ mb: '40px' }}
      />

      <TextField
        variant="standard"
        label="Confirm Password"
        type={passwordVisible === true ? 'text' : 'password'}
        autoComplete="current-password"
        required={true}
        value={passwordCopy}
        onChange={(e) => setPasswordCopy(e.target.value)}
        helperText={passMatchError}
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
