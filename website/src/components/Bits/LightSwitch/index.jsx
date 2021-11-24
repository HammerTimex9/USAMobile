import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightSharpIcon from '@mui/icons-material/NightlightSharp';

import { useColorMode } from '../../../contexts/colorModeContext';

export const LightSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip title={colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
      <IconButton variant="uw" onClick={toggleColorMode}>
        {colorMode === 'light' ? (
          <NightlightSharpIcon
            className="nav-bar-icon"
            sx={{ transform: 'rotate(-45deg)' }}
          />
        ) : (
          <LightModeIcon className="nav-bar-icon" />
        )}
      </IconButton>
    </Tooltip>
  );
};
