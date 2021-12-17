import { useEffect, useState } from 'react';
import { styled } from '@mui/system';
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material';
import moment from 'moment';

import { useNetwork } from '../../../contexts/networkContext';
import { useTransactions } from '../../../hooks/useTransactions';
import { useTokenTransfers } from '../../../hooks/useTokenTransfers';

const HeaderCell = styled(TableCell)({
  padding: '2px 5px',
  fontSize: '10px',
  fontWeight: 'normal',
  textTransform: 'uppercase',
});

const RowCell = styled(TableCell)({
  padding: '4px 5px',
  fontSize: '10px',
});

const emptyList = [
  { timestamp: null, counterparty: 'No transactions found.', amount: null },
];

export const TransactionList = (props) => {
  const { network } = useNetwork();
  const { NativeTxs, NativeIsLoading } = useTransactions({
    chain: network.name,
  });
  const { ERC20Txs, ERC20IsLoading } = useTokenTransfers({
    chain: network.name,
    tokenAddress: props.tokenAddress,
  });
  const [Txs, setTxs] = useState(emptyList);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (props.tokenAddress) {
      setTxs(ERC20Txs);
      setIsLoading(ERC20IsLoading);
    } else {
      setTxs(NativeTxs);
      setIsLoading(NativeIsLoading);
    }
  }, [
    ERC20IsLoading,
    ERC20Txs,
    NativeIsLoading,
    NativeTxs,
    props.tokenAddress,
  ]);

  return (
    <Box sx={{ padding: '0 16px 10px 16px', textAlign: 'center' }}>
      {isLoading ? (
        <CircularProgress size={20} sx={{ my: 1 }} />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <HeaderCell sx={{ fontSize: '10px', fontWeight: 'normal' }}>
                Date
              </HeaderCell>
              <HeaderCell
                align="center"
                sx={{ fontSize: '10px', fontWeight: 'normal' }}
              >
                Time
              </HeaderCell>
              <HeaderCell
                align="center"
                sx={{ fontSize: '10px', fontWeight: 'normal' }}
              >
                Transacted With
              </HeaderCell>
              <HeaderCell
                align="right"
                sx={{ fontSize: '10px', fontWeight: 'normal' }}
              >
                Amount
              </HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Txs?.filter((Tx) => Math.abs(Tx.amount) !== 0).map((Tx) => {
              Tx.timestamp = new Date(Tx.block_timestamp);
              return (
                <TableRow
                  key={Tx.timestamp}
                  sx={{ '&:last-child td': { border: 0 } }}
                >
                  <RowCell>{moment(Tx.timestamp).format('MM/DD/YYYY')}</RowCell>
                  <RowCell align="center">
                    {moment(Tx.timestamp).format('hh:mmA')}
                  </RowCell>
                  <RowCell align="center">{Tx.counterparty}</RowCell>
                  <RowCell align="right">
                    {(Tx.amount / 10 ** props.decimals).toPrecision(3)}
                  </RowCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};
