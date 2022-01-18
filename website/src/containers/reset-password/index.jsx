import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LoadingButton from '@mui/lab/LoadingButton';
import { useMoralis } from 'react-moralis';

import { validateEmail } from '../../utils/helper';
import AuthLayout from '../../components/layouts/AuthLayout';
import { AlertDialog } from '../../components/UW/AlertDialog';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const _email = email.trim();
  const disabled = !validateEmail(_email) || loading;

  const { Moralis } = useMoralis();

  const onCloseAlert = () => setShowAlert(false);

  const handleReset = (e) => {
    e.preventDefault();
    if (email === '') {
      setAlertMessage("Please enter an e-mail, then retry 'Password reset'.");
      setShowAlert(true);
    } else {
      if (!disabled) {
        setLoading(true);
        Moralis.User.requestPasswordReset(_email)
          .then(() => {
            setEmail('');
            setLoading(false);
            setAlertMessage('Reset Password Email Sent! check your email.');
            setShowAlert(true);
          })
          .catch((error) => {
            console.log('EmailError:', error);
            setLoading(false);
            setAlertMessage('There is an error in sending Email. Try again.');
            setShowAlert(true);
          });
      }
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
      <AlertDialog open={showAlert} onClose={onCloseAlert} showCancel={false}>
        {alertMessage}
      </AlertDialog>
    </AuthLayout>
  );
};

export default ResetPassword;
