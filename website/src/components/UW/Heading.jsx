import { Typography } from '@mui/material';

export const Heading = ({ variant = 'h4', sx = {}, ...props }) => {
  return (
    <Typography
      variant={variant}
      sx={[
        {
          fontWeight: 700,
          color: 'text.primary',
          fontSize: '2.25rem',
          textAlign: 'center',
        },
        sx,
      ]}
    >
      {props.children}
    </Typography>
  );
};
