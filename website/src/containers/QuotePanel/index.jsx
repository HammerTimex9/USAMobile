/* eslint-disable prettier/prettier */
import { useEffect } from 'react';
import { Stack } from '@mui/material';
import { useExperts } from '../../contexts/expertsContext';
import { TradeTokens } from '../../components/Bits/TradeTokens';
import { TradeButtonProvider } from '../../contexts/TradeButtonContext';
import { TradeTokensWithIvan } from '../../components/Bits/TradeTokensWithIvan';
import { InstallMetaMaskButton } from '../../components/Bits/InstallMetaMaskButton';
import { useNetwork } from '../../contexts/networkContext';
import { AddNetworkButton } from '../../components/Bits/AddNetworkButton';

export const QuotePanel = () => {
  const { hasPolygon } = useNetwork();
  const { setDialog } = useExperts();
  const hasMetaMask = window.ethereum?.isMetaMask;

  useEffect(() => {
    console.groupCollapsed('QuotePanel::useEffect()');
    console.log('hasMetaMask:', hasMetaMask);
    console.log('hasPolygon:', hasPolygon);
    console.groupEnd();
    if (!hasMetaMask) {
      setDialog('Set up MetaMask on this browser to enable trading.');
    } else if (!hasPolygon) {
      setDialog('Install Polygon into MetaMask to enable discount trading.');
    } else {
      setDialog('Press the Trade Tokens button to execute trades.');
    }
  }, [hasMetaMask, hasPolygon, setDialog]);

  const useIvan = false;

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
              <TradeButtonProvider>
                <TradeTokens />
              </TradeButtonProvider>
            )
          ) : (
            <>
              <AddNetworkButton />
              Add Polygon Network
            </>
          )
        ) : (
          <InstallMetaMaskButton />
        )}
      </Stack>
    </Stack>
  );
};
