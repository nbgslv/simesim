import React from 'react';
import { Country, PlanModel, Prisma } from '@prisma/client';
import TimelineSection from '../components/Timeline/TimelineSection';
import prisma from '../lib/prisma';
import KeepGoApi from '../utils/api/services/keepGo/api';
import { KeepGoResponse } from '../utils/api/services/keepGo/types';
import BundlesSection from '../components/Bundles/BundlesSection';
import QnaSection from '../components/QnA/QnaSection';
import CheckPhoneSection, {
  PhonesList,
} from '../components/CheckPhone/CheckPhoneSection';
import MainLayout from '../components/Layouts/MainLayout';

type HomeProps = {
  countriesList: Country[];
  bundlesList: (PlanModel &
    Prisma.PlanModelGetPayload<{
      include: { refill: { include: { bundle: true } } };
    }>)[];
  phonesList: PhonesList[];
};

export default function Home({
  countriesList,
  bundlesList,
  phonesList,
}: HomeProps): JSX.Element {
  return (
    <MainLayout title="שים eSim">
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
  const countriesListResponse = await prisma.country.findMany({
    where: {
      show: true,
    },
    select: {
      name: true,
      translation: true,
    },
  });
  const bundlesList = await prisma.planModel.findMany({
    select: {
      id: true,
      name: true,
      refill: {
        select: {
          id: true,
          amount_days: true,
          bundle: true,
        },
      },
      description: true,
      price: true,
      vat: true,
    },
  });
  const phonesList: KeepGoResponse | Error = await keepGoApi.getEsimDevices();

  return {
    props: {
      countriesList: countriesListResponse,
      bundlesList,
      phonesList: (phonesList as KeepGoResponse)?.data,
    },
  };
}
