import { Typography } from '@mui/material';

export const Text = ({ variant = 'body1', sx = {}, ...props }) => {
  return (
    <Typography
      variant={variant}
      sx={[
        {
          fontFamily: 'var(--font-family)',
          color: 'var(--color)',
        },
        sx,
      ]}
      {...props}
    >
      {props.children}
    </Typography>
  );
};
