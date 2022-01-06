import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getCustomTheme } from '../theme';

const ColorModeContext = React.createContext();
export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = (props) => {
  const { isAuthenticated } = useMoralis();

  const [colorMode, setColorMode] = useState(
    localStorage.getItem('usa-is-theme-dark') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('usa-is-theme-dark', colorMode);
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  const themeMode = isAuthenticated && colorMode === 'light' ? 'light' : 'dark';

  useEffect(() => {
    document.body.classList.remove(themeMode ? 'dark' : 'light');
    document.body.classList.add(themeMode);
  }, [themeMode]);

  const theme = useMemo(
    () => createTheme(getCustomTheme(themeMode)),
    [themeMode]
  );

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorModeContext;
