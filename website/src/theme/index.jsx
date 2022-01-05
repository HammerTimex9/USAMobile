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
        {
          props: { variant: 'white-round' },
          style: {
            height: 43,
            borderRadius: 25,
            color: '#213DB0',
            background: '#fff',
            boxShadow:
              '0px 4px 20px rgba(0, 0, 0, 0.25), inset 0px 4px 15px rgba(0, 0, 0, 0.25)',
            fontSize: 20,
            fontWeight: 500,
            '&:hover': {
              background: '#fff',
            },
            '&:disabled': {
              color: 'rgb(33, 61, 176, 0.3)',
            },
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
