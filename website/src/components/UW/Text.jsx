import { Typography } from '@mui/material';

export const Text = ({ variant = 'body1', sx = {}, ...props }) => {
  return (
    <Typography
      variant={variant}
      sx={[
        {
          fontFamily: 'P22-Typewriter',
          color: 'text.primary',
        },
        sx,
      ]}
      {...props}
    >
      {props.children}
    </Typography>
  );
};
