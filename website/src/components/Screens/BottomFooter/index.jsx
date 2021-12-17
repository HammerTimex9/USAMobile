import { Stack, Box, Typography } from '@mui/material';
import { useMoralis } from 'react-moralis';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faCoffee } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ByMoralis } from 'react-moralis';

import { useNetwork } from '../../../contexts/networkContext';

import './styles.css';
import ladyLib from '../../../media/Padding/LadyLiberty.jpg';
import installMetamask from '../../../media/Padding/InstallMetamask.png';
import addPolygon from '../../../media/Padding/AddPolygon.png';
import congratulations from '../../../media/Padding/Congratulations.png';

library.add(fab, faCheckSquare, faCoffee);

export const BottomFooter = () => {
  const { isAuthenticated } = useMoralis();
  const { hasPolygon } = useNetwork();

  const hasMetamask = window.ethereum?.isMetaMask;
  let image = ladyLib;
  if (isAuthenticated) {
    if (!hasMetamask) {
      image = installMetamask;
    } else if (!hasPolygon) {
      image = addPolygon;
    } else {
      image = congratulations;
    }
  }

  return (
    <Stack
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        m: 2.5,
        p: 2.5,
      }}
    >
      <Box component="img" sx={{ width: 400, borderRadius: 2.5 }} src={image} />
      <br />
      <br />
      <Stack direction="row">
        <ByMoralis scale="50" />
      </Stack>
      <Stack></Stack>
      <Stack sx={{ mt: 2 }}>
        <Typography>Join the Crypto Nation: </Typography>
      </Stack>
      <Stack
        className="footer-icons"
        direction="row"
        spacing={1}
        sx={{ mt: 2 }}
      >
        <FontAwesomeIcon
          className="FAIcon"
          icon={['fab', 'discord']}
          size="2x"
          color="lightblue"
        />
        <svg
          width="76"
          height="76"
          viewBox="0 0 76 76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="38" cy="38" r="38" fill="currentColor" />
          <g clip-path="url(#clip0_98_18471)">
            <path
              d="M49.8325 41.8125L51.3049 32.2211H42.1011V25.9969C42.1011 23.3734 43.3863 20.8145 47.5087 20.8145H51.6924V12.6492C51.6924 12.6492 47.8963 12.0016 44.2658 12.0016C36.6868 12.0016 31.733 16.5961 31.733 24.9121V32.2228H23.3076V41.8141H31.733V65.0016H42.1011V41.8141L49.8325 41.8125Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_98_18471">
              <rect
                width="53"
                height="53"
                fill="white"
                transform="translate(11 12)"
              />
            </clipPath>
          </defs>
        </svg>
        <FontAwesomeIcon
          className="FAIcon"
          icon={['fab', 'youtube-square']}
          size="2x"
          color="lightblue"
        />
        <FontAwesomeIcon
          className="FAIcon"
          icon={['fab', 'twitter-square']}
          size="2x"
          color="lightblue"
        />
      </Stack>
      {/*<Spacer />*/}
    </Stack>
  );
};
