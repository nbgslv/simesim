import prisma from '../../lib/prisma';
import inngest from './client';
import KeepGoApi from '../api/services/keepGo/api';
import { KeepGoResponse } from '../api/services/keepGo/types';

export default inngest.createFunction(
  { name: 'Sync countries and translate with google api' },
  { event: 'countries.sync' }, // The event(s) that will trigger this function

  // This function will be called every time an event payload is received
  async ({ step }) => {
    const countries = await step.run('Get countries', () => {
      const keepGoApi = new KeepGoApi(
        process.env.KEEPGO_BASE_URL || '',
        process.env.KEEPGO_API_KEY || '',
        process.env.KEEPGO_ACCESS_TOKEN || ''
      );
      return keepGoApi.getCountries();
    });
    if (countries instanceof Error) {
      throw new Error(countries.message);
    }
    if ((countries as KeepGoResponse).countries) {
      const countriesArray = Object.values(
        (countries as KeepGoResponse).countries!
      );
      for (let i = 0; i < countriesArray.length; i += 1) {
        await step.run('Translate country and update in db', async () => {
          const countryInfo = await fetch(
            `https://translation.googleapis.com/language/translate/v2?q=${countriesArray[i]}&target=he&key=${process.env.GOOGLE_API_KEY}`
          );
          const countryInfoJson = await countryInfo.json();
          const translatedCountry = countryInfoJson.data.translations[0].translatedText
            .replace(/[\u0591-\u05C4]/g, '')
            .replace('&#39;', "'");

          const existingCountry = await prisma.country.findUnique({
            where: {
              name: countriesArray[i],
            },
          });
          if (existingCountry) {
            if (!existingCountry.lockTranslation) {
              await prisma.country.update({
                where: {
                  name: countriesArray[i],
                },
                data: {
                  translation: translatedCountry,
                },
              });
            }
          } else {
            await prisma.country.create({
              data: {
                name: countriesArray[i],
                translation: translatedCountry,
                show: false,
              },
            });
          }
        });
        await step.sleep(1000);
      }
    } else {
      throw new Error('No countries were received from KeepGo');
    }
  }
);
