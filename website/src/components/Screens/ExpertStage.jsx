import { Box } from '@mui/material';
import { styled } from '@mui/system';

import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';

const styles = {
  unclesam: {
    backgroundSize: 'auto 190%',
    backgroundPosition: '100% 5%',
  },
  ladyliberty: {
    backgroundSize: 'auto 190%',
    backgroundPosition: '97% -2%',
  },
  mlk: {
    backgroundSize: 'auto 190%',
    backgroundPosition: '90% -8%',
  },
  benfranklin: {
    backgroundSize: 'auto 115%',
    backgroundPosition: '105% -80%',
  },
};

const Panel = styled(Box)(({ character, pose }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: 400,
  height: 200,
  padding: '20px',
  background: 'var(--fade-out-bg)',
  backgroundImage: `url(${process.env.PUBLIC_URL}/images/characters/${character}/${pose}.png)`,
  backgroundRepeat: 'no-repeat',
  ...styles[character],
  boxShadow: 'var(--box-shadow)',
  borderRadius: 40,
  overflow: 'hidden',

  '& .text': {
    width: '50%',
    lineHeight: 1.5,

    '& span': {
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': '6',
      overflow: 'hidden',
    },
  },
}));

export const ExpertStage = () => {
  const { isEnableExpert, character, pose, dialog } = useExperts();
  const { isPolygon } = useNetwork();

  if (isEnableExpert || !isPolygon) {
    return (
      <Panel character={character} pose={pose}>
        <Box className="text">
          <span>{dialog}</span>
        </Box>
      </Panel>
    );
  } else {
    return null;
  }
};