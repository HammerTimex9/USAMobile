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
    fontFamily: 'P22-Typewriter',
  },
  components: {
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
