import React, { useEffect } from 'react';
import { Country, Prisma } from '@prisma/client';
import { Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import BundlesSection from '../../../components/Bundles/BundlesSection';
import MainLayout from '../../../components/Layouts/MainLayout';

const Id = () => {
  const [bundlesList, setBundlesList] = React.useState<
    Prisma.PlanModelGetPayload<{
      include: { refill: { include: { bundle: true } } };
    }>[]
  >([]);
  const [countriesList, setCountriesList] = React.useState<Country[]>([]);
  const [currentPlan, setCurrentPlan] = React.useState<Prisma.PlanGetPayload<{
    include: { country: true };
  }> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const currentPlanResponse = await fetch(
          `/api/order/${id}?action=finish`
        );
        const countriesListResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/country`
        );
        const bundlesListResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/planmodel`
        );
        const currentPlanJson = await currentPlanResponse.json();
        const countriesListJson = await countriesListResponse.json();
        const bundlesListJson = await bundlesListResponse.json();
        setCurrentPlan(currentPlanJson.data);
        setCountriesList(countriesListJson.data.countries);
        setBundlesList(bundlesListJson.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <MainLayout title="ערוך חבילה" hideJumbotron>
      {loading ? (
        <div className="w-100">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <BundlesSection
          countriesList={countriesList}
          bundlesList={bundlesList}
          editMode
          currentBundleId={currentPlan?.planModelId}
          countryId={currentPlan?.country?.id}
          editPlanId={currentPlan?.id}
        />
      )}
    </MainLayout>
  );
};

export default Id;
