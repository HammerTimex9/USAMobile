import { useEffect, useState } from 'react';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useMoralis } from 'react-moralis';
import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH4_API = 'https://api.1inch.io/v4.0/approve';
const CHECK_ENDPOINT = '/allowance';
const GENERATE_ENDPOINT = '/transaction';

export const RequestAllowance = () => {
  const { isAuthenticated, user } = useMoralis();
  const { fromTokenAddress, fromTokenSymbol, fromToken, txAmount } =
    useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();
  const { network } = useNetwork();

  const { buttonText, setButtonText } = useState('TradingAllowance');

  const [allowance, setAllowance] = useState(0);
  const [checking, setChecking] = useState(false);

  const [tradeTxData, setTradeTxData] = useState({});
  const [generating, setGenerating] = useState(false);

  const [setting, setSetting] = useState(false);

  useEffect(() => {
    if (!setting & isAuthenticated) {
      setChecking(true);
      setDialog('Checking ' + fromTokenSymbol + ' trading allowance...');
      const baseURL =
        ONEINCH4_API + '/' + network.id.toString() + CHECK_ENDPOINT;
      const url =
        baseURL +
        '?tokenAddress=' +
        (fromTokenAddress || NATIVE_ADDRESS) +
        '&walletAddress=' +
        user?.attributes['ethAddress'];
      fetch(url, {
        method: 'GET',
      })
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          console.groupCollapsed('RequestAllowance::useEffect(tokenAddress)');
          console.log('response:', response);
          console.groupEnd();
          setChecking(false);
          setAllowance(response.allowance);
          if (allowance > 0) {
            setDialog(
              allowance >= txAmount
                ? 'Found a ' +
                    allowance / 10 ** fromToken?.decimals +
                    ' ' +
                    fromTokenSymbol +
                    ' trading allowance!'
                : 'You will need to unlock ' +
                    (txAmount - allowance) / 10 ** fromToken?.decimals +
                    ' more ' +
                    fromTokenSymbol +
                    ' before you can trade all requested ' +
                    txAmount / 10 ** fromToken?.decimals +
                    ' ' +
                    fromTokenSymbol +
                    '.'
            );
          } else {
            setDialog(
              'No ' +
                fromTokenSymbol +
                ' trading allowance found.  You will have to unlock your ' +
                fromTokenSymbol +
                ' before you can trade it.'
            );
          }
          setButtonText(
            allowance >= txAmount
              ? allowance / 10 ** fromToken?.decimals +
                  ' ' +
                  fromTokenSymbol +
                  ' Unlocked!'
              : 'Unlock all ' +
                  txAmount / 10 ** fromToken?.decimals +
                  ' ' +
                  fromTokenSymbol +
                  ' to trade!'
          ).catch((error) => {
            console.groupCollapsed(
              'RequestAllowance::useEffect(fromTokenAddress)'
            );
            console.log('error:', error);
            console.groupEnd();
            setAllowance(null);
            setChecking(false);
            setButtonText('Re-Check Tx Allowance!');
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTokenAddress, isAuthenticated, setting, user?.attributes]);

  const handleClick = () => {
    setGenerating(true);
    setDialog(
      'Generating transaction to unlock a ' +
        txAmount / 10 ** fromToken.decimals +
        ' ' +
        fromTokenSymbol +
        ' trading allowance.'
    );
    const baseURL =
      ONEINCH4_API + '/' + network.id.toString() + GENERATE_ENDPOINT;
    const url =
      baseURL +
      '?tokenAddress=' +
      (fromTokenAddress || NATIVE_ADDRESS) +
      '&amount=' +
      txAmount;
    fetch(url, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        console.groupCollapsed(
          'RequestAllowance::Generate(tokenAddress,amount)'
        );
        console.log('response:', response);
        console.groupEnd();
        setGenerating(false);
        setTradeTxData(response);
        setDialog(
          'Generated Transaction to unlock ' +
            txAmount / 10 ** fromToken?.decimals +
            ' ' +
            fromTokenSymbol +
            ' to trade.  Please sign this Tx in MetaMask.'
        );
        setButtonText('Sending Unlock Tx for signature...');
      })
      .catch((error) => {
        console.groupCollapsed('RequestAllowance::Generate()::catch(error):');
        console.log('Error:', error);
        console.groupEnd();
        setAllowance(0);
        setGenerating(false);
      });

    // TODO: Fire transaction through MetaMask
    console.log('SIGN ALOWANCE TRANSACTION');
    setSetting(true);
    console.log('tradeTxData:', tradeTxData);
    setSetting(false);
  };

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="sendstart" fullWidth>
        <Tooltip title="Manage token trading allowance.">
          <span>
            <LoadingButton
              disabled={allowance < txAmount}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={checking || generating || setting}
              onClick={handleClick}
              className={
                allowance < txAmount
                  ? 'allowance-button disable'
                  : 'allowance-button'
              }
            >
              {buttonText}
            </LoadingButton>
          </span>
        </Tooltip>
      </FormControl>
    </Box>
  );
};
