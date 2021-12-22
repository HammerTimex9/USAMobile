import { Box } from '@mui/material';
import { styled } from '@mui/system';

import { useExperts } from '../../contexts/expertsContext';
import { useNetwork } from '../../contexts/networkContext';

const Panel = styled(Box)({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: 400,
  height: 200,
  padding: '20px',
  background: 'var(--experts-background)',
  boxShadow: '5px 5px 10px 3px rgba(0, 0, 0, 0.2)',
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

  '& img': {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '200%',
    padding: '10px',
    objectFit: 'contain',
  },
});

export const ExpertStage = () => {
  const { isEnableExpert, character, pose, dialog } = useExperts();
  const { isPolygon } = useNetwork();

  if (isEnableExpert || !isPolygon) {
    return (
      <Panel>
        <Box className="text">
          <span>{dialog}</span>
        </Box>
        <img
          src={`${process.env.PUBLIC_URL}/images/characters/${character}/${pose}.png`}
          alt=""
        />
      </Panel>
    );
  } else {
    return null;
  }
};
