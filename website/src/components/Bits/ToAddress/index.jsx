import { useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import { useMoralis } from 'react-moralis';
import ENSAddress from '@ensdomains/react-ens-address';

import { useActions } from '../../../contexts/actionsContext';
import { useNetwork } from '../../../contexts/networkContext';

import './styles.scss';

export const ToAddress = () => {
  const { web3, enableWeb3, isWeb3Enabled } = useMoralis();
  const { setToToken } = useActions();
  const { isPolygon } = useNetwork();

  useEffect(() => {
    if (!isWeb3Enabled) {
      enableWeb3();
    }
  }, [isWeb3Enabled, enableWeb3]);

  useEffect(() => {
    return () => {
      setToToken();
    };
  }, [setToToken]);

  return (
    <Box sx={{ minWidth: 420 }} className="to-address">
      {isWeb3Enabled && !isPolygon && (
        <ENSAddress
          provider={web3.givenProvider || web3.currentProvider}
          onResolve={({ name, address, type }) => {
            if (
              type &&
              address !== undefined &&
              address !== '0x0000000000000000000000000000000000000000'
            ) {
              setToToken({
                symbol: name,
                address,
              });
              console.groupCollapsed('ToAddress');
              console.log('ENS Resolved To:', {
                name: name,
                address: address,
                type: type,
              });
              console.groupEnd();
            }
          }}
        />
      )}
      {isPolygon && (
        <TextField
          label="Input destination address"
          type="text"
          variant="outlined"
          sx={{
            width: '100%',
            background: 'var(--fade-out-bg)',
            boxShadow: 'var(--box-shadow)',
            borderRadius: '10px',
          }}
          InputProps={{
            sx: { borderRadius: '10px' },
          }}
          onChange={(event) => {
            setToToken({ symbol: '', address: event.target.value });
          }}
        />
      )}
    </Box>
  );
};
