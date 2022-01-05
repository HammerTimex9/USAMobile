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
  const [error, setError] = useState('');

  const handleReset = () => {
    const _email = email.trim();
    if (!validateEmail(_email)) {
      setError('Please use a valid email address.');
      return;
    }

    setError();
    setLoading(true);
    // reset api
    setLoading(false);
  };

  return (
    <AuthLayout title="Reset Password" error={error}>
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
        onClick={handleReset}
        disabled={!email.trim() || loading}
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
