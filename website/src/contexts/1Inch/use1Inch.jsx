import { useAllowance } from './approve/useAllowance';
import { useAllowanceTx } from './approve/useAllowanceTx';
import { useSpender } from './approve/useSpender';
import { useHealthCheck } from './healthcheck/useHealthCheck';
import { useQuote } from './swap/useQuote';
import { useTrade } from './swap/useTrade';

const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const use1Inch = () => {
  const { getAllowance } = useAllowance();
  const { getAllowanceTx } = useAllowanceTx();
  const { getSpenderAddress } = useSpender();
  const { getHealthCheck } = useHealthCheck();
  const { getQuote } = useQuote();
  const { getTradeTx } = useTrade();

  return {
    NATIVE_ADDRESS,
    getAllowance,
    getAllowanceTx,
    getSpenderAddress,
    getHealthCheck,
    getQuote,
    getTradeTx,
  };
};
