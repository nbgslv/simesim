import KeepGoApi from '../../utils/api/services/keepGo/api';
import prisma from '../prisma';
import { PhonesList } from '../../components/CheckPhone/CheckPhoneSection';

const getSupportedPhones = async () => {
  const keepGoApi = new KeepGoApi(
    process.env.KEEPGO_BASE_URL || '',
    process.env.KEEPGO_API_KEY || '',
    process.env.KEEPGO_ACCESS_TOKEN || ''
  );
  return keepGoApi.getEsimDevices();
};

const syncSupportedPhones = async () => {
  try {
    const phonesList = await getSupportedPhones();
    if (phonesList instanceof Error) {
      throw new Error(phonesList.message);
    }
    if (phonesList.data.length) {
      await prisma.$transaction(
        ((phonesList.data as unknown) as PhonesList[])
          .map((listType) =>
            listType.brands.map((brand) =>
              brand.models.map((model) =>
                prisma.supportedPhones.upsert({
                  where: {
                    phoneModel: model,
                  },
                  update: {
                    brand: {
                      connectOrCreate: {
                        where: {
                          name: brand.title,
                        },
                        create: {
                          name: brand.title,
                          exceptions: brand.exceptions,
                        },
                      },
                    },
                    phoneModel: model,
                  },
                  create: {
                    brand: {
                      connectOrCreate: {
                        where: {
                          name: brand.title,
                        },
                        create: {
                          name: brand.title,
                          exceptions: brand.exceptions,
                        },
                      },
                    },
                    phoneModel: model,
                  },
                })
              )
            )
          )
          .flat(2)
      );
    } else {
      throw new Error('No bundles were received from KeepGo');
    }
  } catch (e: Error | any) {
    throw new Error(e.message);
  }
};

export default syncSupportedPhones;
