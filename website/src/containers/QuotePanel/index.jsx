/* eslint-disable prettier/prettier */
import { useEffect } from 'react';
import { Stack } from '@mui/material';
import { useExperts } from '../../contexts/expertsContext';
import { TradeTokens } from '../../components/Bits/TradeTokens';
import { TradeTokensWithIvan } from '../../components/Bits/TradeTokensWithIvan';
import { InstallMetaMaskButton } from '../../components/Bits/InstallMetaMaskButton';
import { useNetwork } from '../../contexts/networkContext';
import { AddNetworkButton } from '../../components/Bits/AddNetworkButton';

const useIvan = true;

export const QuotePanel = () => {
  const { hasPolygon } = useNetwork();
  const { setDialog } = useExperts();
  const hasMetaMask = window.ethereum?.isMetaMask;

  useEffect(() => {
    if (!hasMetaMask) {
      setDialog('Set up MetaMask on this browser to enable trading.');
    } else if (!hasPolygon) {
      setDialog('Install Polygon into MetaMask to enable discount trading.');
    } else {
      setDialog('Press the Trade Tokens button to execute trades.');
    }
  }, [hasMetaMask, hasPolygon, setDialog]);

  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: '3px',
        px: 10,
        py: 2,
      }}
      style={{ paddingRight: 0, paddingLeft: 0 }}
      spacing={2}
    >
      <Stack direction="row">
        {hasMetaMask ? (
          hasPolygon ? (
            useIvan ? (
              <TradeTokensWithIvan />
            ) : (
              <TradeTokens />
            )
          ) : (
            <AddNetworkButton />
          )
        ) : (
          <InstallMetaMaskButton />
        )}
      </Stack>
    </Stack>
  );
};
