import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';

import { validateEmail } from '../../utils/helper';
import AuthLayout from '../../components/layouts/AuthLayout';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const _email = email.trim();
  const disabled = !validateEmail(_email) || loading;

  const handleReset = (e) => {
    e.preventDefault();
    if (!disabled) {
      setLoading(true);
      // reset api
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" onSubmit={handleReset}>
      <TextField
        variant="standard"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: '74px' }}
      />

      <LoadingButton
        variant="white-round"
        type="submit"
        disabled={disabled}
        sx={{ mb: 5 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Reset Password'}
      </LoadingButton>

      <div className="footer">
        Back to <Link to="/login">Log in</Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
