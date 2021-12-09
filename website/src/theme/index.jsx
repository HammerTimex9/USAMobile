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
      variants: [
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
