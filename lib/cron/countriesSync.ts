import inngest from '../../utils/inngest/client';

const syncCountries = async () => {
  try {
    await inngest.send({
      name: 'countries.sync',
      data: {},
    });
  } catch (e: Error | any) {
    throw new Error(e.message);
  }
};

export default syncCountries;
