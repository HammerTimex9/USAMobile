const COLORS = {
  light: '#1a202c',
  dark: 'rgba(255, 255, 255, 0.92)',
};

export const getCustomTheme = (mode = 'light') => ({
  palette: {
    mode,
    text: {
      primary: COLORS[mode],
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: {
      fontSize: '60px',
      lineHeight: '1.172em',
    },
    h2: {
      fontSize: '40px',
      lineHeight: '1.172em',
    },
    h3: {
      fontSize: '30px',
      lineHeight: '1.172em',
    },
  },
  components: {
    MuiTypography: {
      variants: [
        {
          props: { variant: 'subheading01' },
          style: {
            fontSize: '25px',
            lineHeight: '1.172em',
          },
        },
        {
          props: { variant: 'paragraph01' },
          style: {
            fontSize: '26px',
            lineHeight: '1.172em',
          },
        },
        {
          props: { variant: 'paragraph02' },
          style: {
            fontSize: '20px',
            lineHeight: '1.172em',
          },
        },
        {
          props: { variant: 'paragraph03' },
          style: {
            fontSize: '18px',
            lineHeight: '1.172em',
          },
        },
        {
          props: { variant: 'paragraph04' },
          style: {
            fontSize: '16px',
            lineHeight: '1.172em',
          },
        },
      ],
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          lineHeight: 1,
          textTransform: 'initial',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
          padding: ' 0 1.2em',
        },
        startIcon: {
          marginRight: '0.5em',
          '& .MuiSvgIcon-root': {
            fontSize: '0.9em !important',
          },
        },
        endIcon: {
          marginLeft: '0.5em',
          '& .MuiSvgIcon-root': {
            fontSize: '0.9em !important',
          },
        },
      },
      variants: [
        {
          props: { variant: 'white' },
          style: {
            backgroundColor: '#FFFFFF',
            color: '#005EFF',
            '&:hover': {
              backgroundColor: '#C4C4C4',
            },
          },
        },
        {
          props: { variant: 'lightblue' },
          style: {
            backgroundColor: '#005EFF',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#004DAC',
            },
          },
        },
        {
          props: { variant: 'darkblue' },
          style: {
            backgroundColor: '#213DB0',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#0E176B',
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            border: '3px solid #004DAC',
            color: '#213DB0',
            '&:hover': {
              border: '3px solid #004DAC',
            },
          },
        },
        {
          props: { size: 'small' },
          style: {
            height: '50px',
            borderRadius: '25px',
            fontWeight: '500',
            fontSize: '25px',
          },
        },
        {
          props: { size: 'medium' },
          style: {
            height: '60px',
            borderRadius: '30px',
            fontWeight: '500',
            fontSize: '25px',
          },
        },
        {
          props: { size: 'large' },
          style: {
            height: '66px',
            borderRadius: '33px',
            fontWeight: 'bold',
            fontSize: '30px',
          },
        },
        {
          props: { variant: 'uw' },
          style: {
            height: '2.5rem',
            padding: '6px 16px',
            border: `1px solid var(--borderColor)`,
            color: COLORS[mode],
            boxShadow: 'var(--boxShadow)',
          },
        },
      ],
    },
    MuiIconButton: {
      variants: [
        {
          props: { variant: 'uw' },
          style: {
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.25rem',
            border: `1px solid var(--borderColor)`,
            color: COLORS[mode],
            boxShadow: 'var(--boxShadow)',
          },
        },
      ],
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
  },
});
