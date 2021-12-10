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
          borderRadius: 5,
          p: 4,
          width: 400,
          boxShadow: 'var(--boxShadow)',
          backgroundImage: 'var(--bg)',
          lineHeight: 1.5,
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
