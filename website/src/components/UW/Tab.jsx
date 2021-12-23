import { Box } from '@mui/material';
import { Text } from './Text';

export const Tab = ({ sx = {}, label = '', ...props }) => {
  return (
    <Box
      component="button"
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          p: 1,
          alignItems: 'center',
          justifyContent: 'center',
          height: 68,
          borderWidth: 0,
          backgroundColor: 'transparent',
          color: 'var(--tabbar-color)',
        },
        sx,
      ]}
    >
      {props.children}
      <Text
        sx={{
          fontFamily: 'var(--font-family)',
          fontSize: '.75rem',
          color: 'var(--tabbar-color)',
        }}
      >
        {label}
      </Text>
    </Box>
  );
};
