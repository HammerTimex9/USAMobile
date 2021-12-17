import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Collapse,
  IconButton,
  Typography,
  Modal,
  Paper,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { usePositions } from '../../../contexts/portfolioContext';
import { useNetwork } from '../../../contexts/networkContext';
import TokenCard from '../../Bits/TokenCard';
import { TransactionList } from './TransactionList';

export const TokenTable = () => {
  const { totalValue, positions } = usePositions();
  const { network } = useNetwork();
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  const onModalClose = () => setSelectedSymbol();

  function Position(props) {
    const { position } = props;
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <TableRow
          sx={{ '& > *': { borderBottom: 'unset' } }}
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedSymbol(position.symbol)}
        >
          <TableCell component="th" scope="row">
            <Avatar
              sx={{ backgroundColor: '#fff' }}
              name={position.symbol}
              src={position.image}
              size="sm"
            />
          </TableCell>
          <TableCell align="left" sx={{ border: 0 }}>
            <Typography ml={2}>{position.name}</Typography>
          </TableCell>
          <TableCell align="left" sx={{ border: 0 }}>
            <Typography ml={2}>{position.tokens.toPrecision(3)}</Typography>
          </TableCell>
          <TableCell align="left" sx={{ border: 0 }}>
            <Typography ml={2}>
              @ ${position.price && position.price.toFixed(2)}/
              {position.symbol && position.symbol.toUpperCase()}
            </Typography>
          </TableCell>
          <TableCell align="left" sx={{ border: 0 }}>
            <Typography ml={2}> = ${position.value.toFixed(2)}</Typography>
          </TableCell>
          <TableCell sx={{ border: 0 }}>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ m: 1 }}>
                <TransactionList
                  tokenAddress={position.token_address}
                  tokenSymbol={position.symbol.toLowerCase()}
                  chain={network.name}
                  decimals={position.decimals}
                />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          p: 2.5,
          borderRadius: '1.5rem',
          backgroundImage: 'var(--bg)',
          border: 4,
          borderColor: 'var(--borderColor)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={6} sx={{ p: 0, pb: 1 }}>
                <Typography>
                  Total Value: ${parseFloat(totalValue).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => (
              <Position key={position.name} position={position} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={!!selectedSymbol}
        sx={{ maxWidth: '56rem', mx: 'auto', my: '3.56rem' }}
        onBackdropClick={onModalClose}
      >
        <TokenCard symbol={selectedSymbol} onClose={onModalClose} />
      </Modal>
    </>
  );
};
