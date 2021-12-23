export const getCustomTheme = (mode = 'light') => ({
  palette: { mode },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          lineHeight: 1,
          textTransform: 'initial',
          boxShadow: 'var(--box-shadow-outset)',
          height: 44,
          background: 'var(--fade-out-bg)',
        },
      },
      variants: [
        {
          props: { variant: 'uw' },
          style: {
            height: '2.5rem',
            padding: '6px 16px',
            fontFamily: 'var(--font-family)',
            boxShadow: 'var(--box-shadow-outset)',
          },
        },
        {
          props: { variant: 'uw-solid' },
          style: {
            minWidth: '7.5rem',
            fontSize: '1.25rem !important',
            fontFamily: 'var(--font-family)',
            letterSpacing: '.5px',
            textTransform: 'UPPERCASE',
            borderRadius: 'var(--border-radius)',
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
            boxShadow: 'var(--box-shadow-outset)',
            background: 'var(--fade-out-bg)',
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
