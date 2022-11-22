import KeepGoApi from '../../utils/api/sevices/keepGo/api';
import prisma from '../prisma';
import { Bundle, Refill } from '../../utils/api/sevices/keepGo/types';

const getBundles = async () => {
  const keepGoApi = new KeepGoApi(
    process.env.KEEPGO_BASE_URL || '',
    process.env.KEEPGO_API_KEY || '',
    process.env.KEEPGO_ACCESS_TOKEN || ''
  );
  return keepGoApi.getBundles();
};

const syncBundles = async () => {
  try {
    const bundles = await getBundles();
    if (bundles instanceof Error) {
      throw new Error(bundles.message);
    }
    if (bundles.bundles?.length) {
      await prisma.$transaction(
        bundles.bundles.map((bundle: Bundle) =>
          prisma.bundle.upsert({
            update: {
              externalId: bundle.id.toString(),
              typeId: bundle.typeId,
              name: bundle.name,
              description: bundle.description,
              coverage: bundle.coverage,
              refills: {
                create: bundle.refills.map((refill: Refill) => ({
                  title: refill.title,
                  amount_mb: refill.amount_mb,
                  amount_days: refill.amount_days,
                  price_usd: refill.price_usd,
                  price_eur: refill.price_eur,
                })),
              },
            },
            create: {
              externalId: bundle.id.toString(),
              typeId: bundle.typeId,
              name: bundle.name,
              description: bundle.description,
              coverage: bundle.coverage,
              refills: {
                create: bundle.refills.map((refill: Refill) => ({
                  title: refill.title,
                  amount_mb: refill.amount_mb,
                  amount_days: refill.amount_days,
                  price_usd: refill.price_usd,
                  price_eur: refill.price_eur,
                })),
              },
            },
            where: {
              externalId: bundle.id.toString(),
            },
          })
        )
      );
    } else {
      throw new Error('No bundles were received from KeepGo');
    }
  } catch (e: Error | any) {
    throw new Error(e.message);
  }
};

export default syncBundles;
