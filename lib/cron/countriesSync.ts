import KeepGoApi from "../../utils/api/sevices/keepGo/api";
import prisma from "../prisma";
import Bottleneck from "bottleneck";

const getCountries = async () => {
    const keepGoApi = new KeepGoApi(process.env.KEEPGO_BASE_URL || '', process.env.KEEPGO_API_KEY || '', process.env.KEEPGO_ACCESS_TOKEN || '');
    const countries = await keepGoApi.getCountries();
    return countries
}

const syncCountries = async () => {
    try {
        const limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 1000,
        })
        const countries = await getCountries();
        if (countries instanceof Error) {
            throw new Error(countries.message);
        }
        if (countries.countries) {
            const translatedCountries = await Promise
                .all(
                    Object
                        .values(countries.countries)
                        .map(async (country: string) => {
                            const countryInfoRequestWrapped = limiter.wrap(fetch)
                            const countryInfo = await countryInfoRequestWrapped(
                                `https://translation.googleapis.com/language/translate/v2?q=${country}&target=he&key=${process.env.GOOGLE_API_KEY}`
                            );
                            const countryInfoJson = await countryInfo.json();
                            const translatedCountry = countryInfoJson.data.translations[0].translatedText;
                            return {
                                name: country,
                                translation: translatedCountry
                            };
                        })
                )
            await prisma.$transaction(
               Object.values(translatedCountries).map((country) => (
                   prisma.country.upsert({
                        update: {
                            name: country.name,
                            translation: country.translation
                        },
                        create: {
                            name: country.name,
                            translation: country.translation
                        },
                        where: {
                            name: country.name,
                            lockTranslation: false
                        }
                   })
               ))
            )
        } else {
            throw new Error('No countries were received from KeepGo');
        }
    } catch (e: Error | any) {
        throw new Error(e.message);
    }
}

export default syncCountries;
