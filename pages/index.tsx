import React, { useEffect } from 'react';
import { Country, PlanModel, Prisma } from '@prisma/client';
import { useRouter } from 'next/router';
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
  const [bucket, setBucket] = React.useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (router.query.mvt && router.query.mvt === 'b') {
      setBucket('b');
    }
  }, [router.query.mvt]);

  return (
    <MainLayout
      title="שים eSim"
      metaDescription={'שים eSim חבילות גלישה זולות לחו"ל בלי להחליף כרטיס sim'}
      metaCanonical={`${process.env.NEXT_PUBLIC_BASE_URL}/`}
    >
      <BundlesSection
        bucket={bucket}
        countriesList={countriesList}
        bundlesList={bundlesList}
      />
      <TimelineSection />
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
          amount_mb: true,
          bundle: {
            select: {
              id: true,
              coverage: true,
            },
          },
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
