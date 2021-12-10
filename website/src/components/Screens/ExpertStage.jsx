import { Box, Stack } from '@mui/material';

import FranklinBlue from '../../assets/characters/franklin-blue.svg';
import FranklinRed from '../../assets/characters/franklin-red.svg';
import LadylibertyBlue from '../../assets/characters/ladyliberty-blue.svg';
import LadylibertyRed from '../../assets/characters/ladyliberty-red.svg';
import MlkingBlue from '../../assets/characters/mlking-blue.svg';
import MlkingRed from '../../assets/characters/mlking-red.svg';
import UnclesamBlue from '../../assets/characters/unclesam-blue.svg';
import UnclesamRed from '../../assets/characters/unclesam-red.svg';

import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';

const Characters = {
  light: {
    franklin: FranklinRed,
    ladyliberty: LadylibertyRed,
    mlking: MlkingRed,
    unclesam: UnclesamRed,
  },
  dark: {
    franklin: FranklinBlue,
    ladyliberty: LadylibertyBlue,
    mlking: MlkingBlue,
    unclesam: UnclesamBlue,
  },
};

export const ExpertStage = () => {
  const { expertsOn, character, dialog } = useExperts();
  const { colorMode } = useColorMode();
  const { isPolygon } = useNetwork();
  const src = Characters[colorMode][character];

  if (expertsOn === true || !isPolygon) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: 4,
          py: 3,
          width: 400,
          lineHeight: 1.5,
          background:
            colorMode === 'light'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(261.33deg, rgba(255, 255, 255, 0.4) 1.9%, rgba(255, 255, 255, 0) 97.43%)',
          boxShadow: '5px 5px 10px 3px rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
        }}
      >
        <Box>{dialog}</Box>
        <img src={src} alt="" width="180" />
      </Stack>
    );
  } else {
    return null;
  }
};
