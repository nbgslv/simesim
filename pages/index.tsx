import React from 'react';
import {
  Country,
  PhoneBrand,
  PlanModel,
  Prisma,
  SupportedPhones,
} from '@prisma/client';
import TimelineSection from '../components/Timeline/TimelineSection';
import prisma from '../lib/prisma';
import BundlesSection from '../components/Bundles/BundlesSection';
import QnaSection from '../components/QnA/QnaSection';
import CheckPhoneSection from '../components/CheckPhone/CheckPhoneSection';
import MainLayout from '../components/Layouts/MainLayout';

type HomeProps = {
  countriesList: Country[];
  bundlesList: (PlanModel &
    Prisma.PlanModelGetPayload<{
      include: { refill: { include: { bundle: true } } };
    }>)[];
  phonesList: (SupportedPhones & { brand: PhoneBrand })[];
};

export default function Home({
  countriesList,
  bundlesList,
  phonesList,
}: HomeProps): JSX.Element {
  return (
    <MainLayout
      title="שים eSim"
      metaDescription={'שים eSim חבילות גלישה זולות לחו"ל בלי להחליף כרטיס sim'}
      metaCanonical={`${process.env.NEXT_PUBLIC_BASE_URL}/`}
    >
      <BundlesSection countriesList={countriesList} bundlesList={bundlesList} />
      <TimelineSection />
      <QnaSection />
      <CheckPhoneSection phonesList={phonesList} />
    </MainLayout>
  );
}

export async function getStaticProps() {
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
  const phonesList: Prisma.SupportedPhonesGetPayload<{
    select: {
      id: true;
      phoneModel: true;
      brand: {
        select: {
          id: true;
          name: true;
          exceptions: true;
        };
      };
    };
  }>[] = await prisma.supportedPhones.findMany({
    select: {
      id: true,
      phoneModel: true,
      brand: {
        select: {
          id: true,
          name: true,
          exceptions: true,
        },
      },
    },
  });

  return {
    props: {
      countriesList: countriesListResponse,
      bundlesList,
      phonesList,
    },
  };
}
