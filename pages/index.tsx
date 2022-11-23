import React from 'react';
import { Country, Prisma, Bundle } from '@prisma/client';
import TimelineSection from '../components/Timeline/TimelineSection';
import KeepGoApi from '../utils/api/sevices/keepGo/api';
import { KeepGoResponse } from '../utils/api/sevices/keepGo/types';
import BundlesSection from '../components/Bundles/BundlesSection';
import QnaSection from '../components/QnA/QnaSection';
import CheckPhoneSection, {
  PhonesList,
} from '../components/CheckPhone/CheckPhoneSection';
import MainLayout from '../components/Layouts/MainLayout';

type HomeProps = {
  countriesList: Country[];
  bundlesList: (Bundle &
    Prisma.BundleGetPayload<{ select: { refills: true } }>)[];
  phonesList: PhonesList[];
};

export default function Home({
  countriesList,
  bundlesList,
  phonesList,
}: HomeProps): JSX.Element {
  return (
    <MainLayout>
      <TimelineSection />
      <BundlesSection countriesList={countriesList} bundlesList={bundlesList} />
      <QnaSection />
      <CheckPhoneSection phonesList={phonesList} />
    </MainLayout>
  );
}

export async function getStaticProps() {
  const keepGoApi = new KeepGoApi(
    process.env.KEEPGO_BASE_URL || '',
    process.env.KEEPGO_API_KEY || '',
    process.env.KEEPGO_ACCESS_TOKEN || ''
  );
  const countriesListResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/country`
  );
  const countriesList: Partial<Country>[] = await countriesListResponse.json();
  const bundlesList: KeepGoResponse | Error = await keepGoApi.getBundles();
  const phonesList: KeepGoResponse | Error = await keepGoApi.getEsimDevices();

  if (bundlesList instanceof Error || phonesList instanceof Error) {
    return {
      props: {
        countriesList: [],
        bundlesList: [],
        phonesList: [],
      },
    };
  }

  return {
    props: {
      countriesList,
      bundlesList: bundlesList.bundles,
      phonesList: phonesList.data,
    },
  };
}
