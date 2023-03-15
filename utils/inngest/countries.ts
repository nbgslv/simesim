import Bottleneck from 'bottleneck';
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
    const limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 1000,
    });
    if (countries instanceof Error) {
      throw new Error(countries.message);
    }
    if ((countries as KeepGoResponse).countries) {
      const countriesArray = Object.values(
        (countries as KeepGoResponse).countries!
      );
      const translatedCountries = await step.run(
        'Translate country',
        async () => {
          const translations = [];
          const countryInfoRequestWrapped = limiter.wrap(fetch);
          for (let i = 0; i < countriesArray.length; i += 1) {
            const countryInfo = await countryInfoRequestWrapped(
              `https://translation.googleapis.com/language/translate/v2?q=${countriesArray[i]}&target=he&key=${process.env.GOOGLE_API_KEY}`
            );
            const countryInfoJson = await (countryInfo as Response).json();
            const translatedCountry = countryInfoJson.data.translations[0].translatedText
              .replace(/[\u0591-\u05C4]/g, '')
              .replace('&#39;', "'");
            translations.push({
              name: countriesArray[i],
              translation: translatedCountry,
            });
          }
          return translations;
        }
      );
      await step.run('Update countries in db', async () => {
        for (let i = 0; i < translatedCountries.length; i += 1) {
          const existingCountry = await prisma.country.findUnique({
            where: {
              name: translatedCountries[i].name,
            },
          });
          if (existingCountry) {
            if (!existingCountry.lockTranslation) {
              await prisma.country.update({
                where: {
                  name: translatedCountries[i].name,
                },
                data: {
                  translation: translatedCountries[i].translation,
                },
              });
            }
          } else {
            await prisma.country.create({
              data: {
                name: translatedCountries[i].name,
                translation: translatedCountries[i].translation,
                show: false,
              },
            });
          }
        }
      });
    } else {
      throw new Error('No countries were received from KeepGo');
    }
  }
);
