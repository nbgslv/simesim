import { parse } from 'date-fns';
import { PlanStatus } from '@prisma/client';
import KeepGoApi from '../../utils/api/services/keepGo/api';
import prisma from '../prisma';
import { Line as ApiLineType } from '../../utils/api/services/keepGo/types';

const getLines = async () => {
  let totalPages = 1;
  const keepGoApi = new KeepGoApi(
    process.env.KEEPGO_BASE_URL || '',
    process.env.KEEPGO_API_KEY || '',
    process.env.KEEPGO_ACCESS_TOKEN || ''
  );
  return async (page: number, perPage: number) => {
    const lines = await keepGoApi.getLines(page, perPage);
    if (lines instanceof Error) {
      throw new Error(lines.message);
    }
    totalPages = lines.sim_cards?.last_page || 1;
    return {
      lines: lines.sim_cards?.items || [],
      totalPages,
    };
  };
};

const syncLines = async () => {
  try {
    const perPage = 25;
    const allLines = [];
    const firstCall = await getLines();
    const { lines, totalPages } = await firstCall(1, perPage);
    allLines.push(...lines);
    if (totalPages > 1) {
      for (let i = 2; i <= totalPages; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const { lines: nextLines } = await firstCall(i, perPage);
        allLines.push(...nextLines);
      }
    }

    if (allLines.length) {
      await prisma.$transaction(
        allLines
          .map((line: ApiLineType) => {
            const queries = [];
            if (line.status === 'Deactivated') {
              let lineNotes: string | Record<string, string> = '';
              try {
                lineNotes = JSON.parse(line.notes);
              } catch (e) {
                console.error(e);
              }
              if ((lineNotes as Record<string, string>)?.planId) {
                queries.push(
                  prisma.plan.update({
                    where: {
                      id: (lineNotes as Record<string, string>).planId,
                    },
                    data: {
                      status: PlanStatus.EXPIRED,
                    },
                  })
                );
              }
            }
            queries.push(
              prisma.line.upsert({
                update: {
                  deactivationDate: line.deactivation_date
                    ? parse(
                        line.deactivation_date,
                        'yyyy-MM-dd HH:mm:ss',
                        new Date()
                      )
                    : null,
                  expiredAt: line.expired_at
                    ? parse(line.expired_at, 'yyyy-MM-dd HH:mm:ss', new Date())
                    : null,
                  remainingUsageKb: line.remaining_usage_kb,
                  remainingDays: line.remaining_days,
                  status: line.status,
                  notes: line.notes,
                  autoRefillTurnedOn: line.auto_refill_turned_on,
                  autoRefillAmountMb: line.auto_refill_amount_mb?.toString(),
                  autoRefillPrice: line.auto_refill_price,
                  autoRefillCurrency: line.auto_refill_currency,
                },
                create: {
                  iccid: line.iccid,
                  notes: line.notes,
                  qrCode: '',
                  lpaCode: '',
                  deactivationDate: line.deactivation_date
                    ? parse(
                        line.deactivation_date,
                        'yyyy-MM-dd HH:mm:ss',
                        new Date()
                      )
                    : null,
                  expiredAt: line.expired_at
                    ? parse(line.expired_at, 'yyyy-MM-dd HH:mm:ss', new Date())
                    : null,
                  remainingUsageKb: line.remaining_usage_kb,
                  remainingDays: line.remaining_days,
                  status: line.status,
                  autoRefillTurnedOn: line.auto_refill_turned_on,
                  autoRefillAmountMb: line.auto_refill_amount_mb?.toString(),
                  autoRefillPrice: line.auto_refill_price,
                  autoRefillCurrency: line.auto_refill_currency,
                },
                where: {
                  iccid: line.iccid,
                },
              })
            );
            return queries;
          })
          .flat(2)
      );
    } else {
      throw new Error('No lines were received from KeepGo');
    }
  } catch (e: Error | any) {
    throw new Error(e.message);
  }
};

export default syncLines;
