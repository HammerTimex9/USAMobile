import { styled } from '@mui/system';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import LogoUrl from '../../assets/logos/logo-usawallet.svg';
import BgUrl from '../../assets/bg-dark.svg';

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  height: '100vh',
  padding: '0 20px',
  backgroundImage: `url(${BgUrl}), var(--gradient-300)`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '70%, 100%',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  color: '#fff',

  img: {
    position: 'absolute',
    top: 45,
    height: 45,
  },

  h1: {
    marginTop: 0,
    marginBottom: 30,
  },

  '.content': {
    width: '100%',
    maxWidth: 300,

    '.footer': {
      textAlign: 'center',
      a: {
        color: 'inherit',
      },
    },
  },
});

const AuthLayout = ({ title, error, children }) => {
  return (
    <Wrapper>
      <img src={LogoUrl} alt="logo" />

      {!!error && (
        <Alert variant="filled" severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <h1>{title}</h1>

      <Stack direction="column" className="content" spacing={4}>
        {children}
      </Stack>
    </Wrapper>
  );
};

export default AuthLayout;
