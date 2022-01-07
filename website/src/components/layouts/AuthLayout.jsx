import { styled } from '@mui/system';
import Alert from '@mui/material/Alert';

import LogoUrl from '../../assets/logos/logo-usawallet.svg';

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  height: '100vh',
  padding: '0 20px',

  img: {
    position: 'absolute',
    top: 45,
    height: 45,
  },

  h1: {
    marginTop: 0,
    marginBottom: 30,
  },
});

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: 300,

  a: {
    color: 'inherit',
  },

  '.footer': {
    textAlign: 'center',
  },
});

const AuthLayout = ({ title, error, onSubmit, children }) => {
  return (
    <Wrapper>
      <img src={LogoUrl} alt="logo" />

      {!!error && (
        <Alert variant="filled" severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <h1>{title}</h1>

      <Form onSubmit={onSubmit}>{children}</Form>
    </Wrapper>
  );
};

export default AuthLayout;
