import { Box, Stack } from '@mui/material';

import LibertyFox from '../../media/characters/LibertyFox.png';
import SamEagle from '../../media/characters/SamEagle.png';
import Benicorn from '../../media/characters/Benicorn.png';
import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';

const Icons = {
  '': SamEagle,
  idle: SamEagle,
  portfolio: SamEagle,
  chart: SamEagle,
  trade: Benicorn,
  swap: Benicorn,
  buy: LibertyFox,
  sell: LibertyFox,
  send: LibertyFox,
  receive: LibertyFox,
  gallery: LibertyFox,
};

export const ExpertStage = () => {
  const { expertsOn, actionMode, dialog } = useExperts();
  const { isPolygon } = useNetwork();
  const icon = Icons[actionMode];

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
        }}
      >
        <Box>{dialog}</Box>
        <img src={icon} alt="" width="180" />
      </Stack>
    );
  } else {
    return null;
  }
};
