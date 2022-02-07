import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Box, FormControl, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useMoralis } from 'react-moralis';
import { useActions } from '../../contexts/actionsContext';
import { useExperts } from '../../contexts/expertsContext';
import { useColorMode } from '../../contexts/colorModeContext';
import { useNetwork } from '../../contexts/networkContext';
import { useAllowance } from '../../contexts/allowanceContext';

const NODE_URL =
  'wss://speedy-nodes-nyc.moralis.io/df08fdd9ffc987fa73735432/polygon/mainnet/ws';
const provider = new ethers.providers.WebSocketProvider(NODE_URL);
const signer = provider.getSigner();
const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const ONEINCH_API = 'https://api.1inch.io/v4.0/';
const CHECK_ENDPOINT = '/approve/allowance';
const GENERATE_ENDPOINT = '/approve/transaction';
const BROADCAST_ENDPOINT = '/broadcast';

export const RequestAllowance = () => {
  const { isAuthenticated, user } = useMoralis();
  const { fromTokenAddress, fromTokenSymbol, fromToken, txAmount } =
    useActions();
  const { setDialog } = useExperts();
  const { colorMode } = useColorMode();

  const { network } = useNetwork();
  const checkAPI = ONEINCH_API + network.id.toString() + CHECK_ENDPOINT;
  const generateAPI = ONEINCH_API + network.id.toString() + GENERATE_ENDPOINT;
  const broadcastAPI = ONEINCH_API + network.id.toString() + BROADCAST_ENDPOINT;

  const { allowance, setAllowance } = useAllowance();

  const { buttonText, setButtonText } = useState('TradingAllowance');

  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [signing, setSigning] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    if (!checking & !generating & !signing & !broadcasting & isAuthenticated) {
      setChecking(true);
      setDialog('Checking ' + fromTokenSymbol + ' trading allowance...');
      const checkURL =
        checkAPI +
        '?tokenAddress=' +
        (fromTokenAddress || NATIVE_ADDRESS) +
        '&walletAddress=' +
        user?.attributes['ethAddress'];
      fetch(checkURL, {
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
  }, [
    allowance,
    checking,
    fromTokenAddress,
    generating,
    isAuthenticated,
    signing,
    broadcasting,
    txAmount,
    user?.attributes,
  ]);

  const handleClick = () => {
    setGenerating(true);
    setDialog(
      'Generating transaction to unlock a ' +
        txAmount / 10 ** fromToken.decimals +
        ' ' +
        fromTokenSymbol +
        ' trading allowance.'
    );
    const generateURL =
      generateAPI +
      '?tokenAddress=' +
      (fromTokenAddress || NATIVE_ADDRESS) +
      '&amount=' +
      txAmount;
    fetch(generateURL, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .then((allowanceTxData) => {
        console.groupCollapsed(
          'RequestAllowance::Generate(tokenAddress,amount)'
        );
        console.log('allowanceTxData:', allowanceTxData);
        console.groupEnd();
        setGenerating(false);
        setDialog(
          'Please sign this transaction in MetaMask to unlock ' +
            txAmount / 10 ** fromToken?.decimals +
            ' ' +
            fromTokenSymbol +
            ' for trade.'
        );
        setButtonText('Sending Unlock Tx for signature...');
        setSigning(true);
        signer
          .signTransaction(allowanceTxData)
          .then((response) => {
            return response.json;
          })
          .then((signedTx) => {
            console.groupCollapsed('RequestAllowance:signer.signTx():');
            console.log('signedTx:', signedTx);
            console.groupEnd();
            setSigning(false);
            setBroadcasting(true);
            setDialog(
              'broadcasting signed allowance transaction to blockchain...'
            );
            setButtonText('broadcasting...');
            fetch(broadcastAPI, {
              method: 'post',
              body: JSON.stringify({ signedTx }),
              headers: { 'Content-Type': 'application/json' },
            })
              .then((result) => result.json())
              .then((txReceipt) => {
                console.groupCollapsed('RequestAllowance::broadcast()');
                console.log('receipt:', txReceipt);
                console.groupEnd();
                setBroadcasting(false);
                setDialog('Allowance Transaction Receipt received.');
                setButtonText('Tx Receipt Received!');
              })
              .catch((error) => {
                console.groupCollapsed('RequestAllowance::brodcastError()');
                console.log('broadcast error: ', error);
                console.groupEnd();
                setBroadcasting(false);
              });
          })
          .catch((error) => {
            console.groupCollapsed('RequestAllowance::signatureError()');
            console.log('signing error: ', error);
            console.groupEnd();
            setSigning(false);
          })
          .catch((error) => {
            console.groupCollapsed(
              'RequestAllowance::Generate()::catch(error):'
            );
            console.log('Error:', error);
            console.groupEnd();
            setAllowance(0);
            setGenerating(false);
          });
      });
  };

  return (
    <Box style={{ marginTop: 20 }}>
      <FormControl id="allowance" fullWidth>
        <Tooltip title="Manage token trading allowance.">
          <span>
            <LoadingButton
              disabled={allowance < txAmount}
              variant={colorMode === 'light' ? 'outlined' : 'contained'}
              sx={{ boxShadow: 'var(--box-shadow)' }}
              loading={checking || generating || signing || broadcasting}
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
