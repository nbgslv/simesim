import KeepGoApi from '../../utils/api/services/keepGo/api';
import prisma from '../prisma';
import { Transaction as ApiTransactionType } from '../../utils/api/services/keepGo/types';

const getTransactions = async () => {
  const keepGoApi = new KeepGoApi(
    process.env.KEEPGO_BASE_URL || '',
    process.env.KEEPGO_API_KEY || '',
    process.env.KEEPGO_ACCESS_TOKEN || ''
  );
  return keepGoApi.getTransactions();
};

const syncTransactions = async () => {
  try {
    const transactions = await getTransactions();
    if (transactions instanceof Error) {
      throw new Error(transactions.message);
    }

    if (transactions.transactions?.data?.length) {
      await prisma.$transaction(
        transactions.transactions.data.map((transaction: ApiTransactionType) =>
          prisma.transaction.upsert({
            update: {
              createdAtExternal: transaction.created_at,
              status: transaction.status,
              amount: transaction.amount,
              currency: transaction.currency,
              type: transaction.type,
              invoiceHash: transaction.invoice_hash,
              refillAmountMb: transaction.refill_amount_mb,
              reason: transaction.reason,
              transactionId: transaction.transaction_id,
            },
            create: {
              createdAtExternal: transaction.created_at,
              status: transaction.status,
              amount: transaction.amount,
              currency: transaction.currency,
              type: transaction.type,
              invoiceHash: transaction.invoice_hash,
              refillAmountMb: transaction.refill_amount_mb,
              reason: transaction.reason,
              transactionId: transaction.transaction_id,
            },
            where: {
              transactionId: transaction.transaction_id,
            },
          })
        )
      );
    } else {
      throw new Error('No transactions were received from KeepGo');
    }
  } catch (e: Error | any) {
    throw new Error(e.message);
  }
};

export default syncTransactions;
