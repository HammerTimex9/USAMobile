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
    primary: {
      light: '005EFF',
      main: '#213DB0',
      dark: '111111',
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: 'B31942',
      main: '#CB151C',
      contrastText: '#FFFFFF',
    },
    blue: {
      50: '#76A6F8',
      100: '#2B79FF',
      300: '#005EFF',
      500: '#213DB0',
      700: '#111111',
      900: '#0E176B',
      A100: '#0A3161',
    },
    grey: {
      50: '#FFFFFF',
      100: '#EDEDED',
      300: '#C4C4C4',
      500: '#ABABAB',
      700: '#8C8C8C',
      900: '#000000',
    },
    red: {
      50: '#F54F55',
      100: '#ED1C24',
      300: '#B31942',
      500: '#CB151C',
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
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
          },
        },
        {
          props: { variant: 'uw-solid' },
          style: {
            minWidth: '7.5rem',
            color: '#213DB0',
            background: '#FFFFFF',
            boxShadow:
              '0px 4px 20px rgba(0, 0, 0, 0.25), inset 0px 4px 15px rgba(0, 0, 0, 0.25)',
            fontSize: '1.25rem !important',
            fontFamily: 'Roboto, sans-serif !important',
            letterSpacing: '.5px',
            textTransform: 'UPPERCASE',
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
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
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
