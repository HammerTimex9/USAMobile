import { IconButton, Tooltip } from '@mui/material';

import { useExperts } from '../../contexts/expertsContext';
import { EyeOpenSvg, EyeCloseSvg } from '../../assets/icons';

export const ExpertButton = () => {
  const { isEnableExpert, enableExpert } = useExperts();

  return (
    <Tooltip title="Toggle expert advice.">
      <IconButton variant="uw" onClick={() => enableExpert(!isEnableExpert)}>
        {isEnableExpert ? <EyeCloseSvg /> : <EyeOpenSvg />}
      </IconButton>
    </Tooltip>
  );
};
