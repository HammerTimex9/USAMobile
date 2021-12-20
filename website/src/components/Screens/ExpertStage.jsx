import { Box } from '@mui/material';

import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';

export const ExpertStage = () => {
  const { isEnableExpert, character, pose, dialog } = useExperts();
  const { colorMode } = useColorMode();
  const { isPolygon } = useNetwork();

  if (isEnableExpert || !isPolygon) {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: 400,
          minHeight: 200,
          padding: '20px',
          background:
            colorMode === 'light'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(261.33deg, rgba(255, 255, 255, 0.4) 1.9%, rgba(255, 255, 255, 0) 97.43%)',
          boxShadow: '5px 5px 10px 3px rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ width: '50%', lineHeight: 1.5 }}>{dialog}</Box>
        <img
          src={`${process.env.PUBLIC_URL}/images/characters/${character}/${pose}.png`}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '200%',
            padding: '10px',
            objectFit: 'contain',
          }}
        />
      </Box>
    );
  } else {
    return null;
  }
};
