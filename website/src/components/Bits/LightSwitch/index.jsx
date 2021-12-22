import { IconButton, Tooltip } from '@mui/material';

import { useColorMode } from '../../../contexts/colorModeContext';
import { MoonSvg, SunSvg } from '../../../assets/icons';

export const LightSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip title={colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
      <IconButton variant="uw" onClick={toggleColorMode}>
        {colorMode === 'light' ? <MoonSvg /> : <SunSvg />}
      </IconButton>
    </Tooltip>
  );
};
