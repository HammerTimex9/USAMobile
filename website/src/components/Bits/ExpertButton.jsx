import { IconButton, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import BlockIcon from '@mui/icons-material/Block';

import { useExperts } from '../../contexts/expertsContext';

export const ExpertButton = () => {
  const { isEnableExpert, enableExpert } = useExperts();

  return (
    <Tooltip title="Toggle expert advice.">
      <IconButton variant="uw" onClick={() => enableExpert(!isEnableExpert)}>
        {isEnableExpert ? (
          <BlockIcon className="nav-bar-icon" />
        ) : (
          <ChatIcon className="nav-bar-icon" />
        )}
      </IconButton>
    </Tooltip>
  );
};
