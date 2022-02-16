import { Box, Button, Stack } from '@mui/material';
import { styled } from '@mui/system';
import { PhoneIcon } from '@chakra-ui/icons';

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

    // '& span': {
    //   display: '-webkit-box',
    //   '-webkit-box-orient': 'vertical',
    //   '-webkit-line-clamp': '6',
    //   overflow: 'hidden',
    // },
  },
}));

const Smashy = styled(Button)(() => ({
  position: 'relative',
  disply: 'flex',
  alignItems: 'center',
  width: 150,
  height: 30,
  padding: '20px',
  marginLeft: '120px',
  background: 'var(--fade-out-bg)',
  boxShadow: 'var(--box-shadow)',
  borderRadius: 40,
  overflow: 'hidden',
}));

const handleClick = () => {
  window.open('tel:8882116906');
};

export const ExpertStage = () => {
  const { isEnableExpert, character, pose, dialog } = useExperts();
  const { isPolygon } = useNetwork();

  if (isEnableExpert || !isPolygon) {
    return (
      <Stack>
        <Panel character={character} pose={pose}>
          <Box className="text">
            <span>{dialog}</span>
          </Box>
        </Panel>
        <br />
        <Smashy onClick={handleClick}>
          <PhoneIcon />. Call for help.
        </Smashy>
      </Stack>
    );
  } else {
    return null;
  }
};
