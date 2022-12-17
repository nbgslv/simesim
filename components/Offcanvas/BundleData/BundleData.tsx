import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode, useState } from 'react';
import { Bundle, Prisma } from '@prisma/client';
import { Button, Spinner } from 'react-bootstrap';
import AdminApi from '../../../utils/api/services/adminApi';
import CountriesAdminModal from '../../Countries/CountriesAdminModal';
import { Refills } from '../../Refills/RefillsAdminModal';
import Section, { SectionType } from '../Section';

const BundleData = ({
  bundle,
  onDataChange,
}: {
  bundle: Bundle & Prisma.BundleGetPayload<{ select: { refills: true } }>;
  onDataChange?: (data: Bundle | null) => void;
}) => {
  const [adminApi] = React.useState<AdminApi>(new AdminApi());
  const [loading, setLoading] = useState<boolean>(false);

  if (!bundle) return null;

  const data: SectionType<
    Bundle & Prisma.BundleGetPayload<{ select: { refills: true } }>
  >[] = [
    {
      title: 'Bundle',
      id: 'bundle',
      data: [
        {
          title: 'ID',
          value: bundle.id,
          type: 'text',
        },
        {
          title: 'External ID',
          value: bundle.externalId,
          type: 'text',
        },
        {
          title: 'Name',
          value: bundle.name,
          type: 'text',
        },
        {
          title: 'Description',
          value: bundle.description,
          type: 'text',
        },
        {
          title: 'Coverage',
          value: bundle.coverage,
          type: 'text',
          RenderData: (value): ReactNode => {
            const [
              showCountriesModal,
              setShowCountriesModal,
            ] = useState<boolean>(false);
            const [hover, setHover] = useState<number>(-1);

            return (
              <div className="text-center d-flex flex-column">
                <div>
                  {(value as string[]).map((country: string, i: number) => (
                    <>
                      <span
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(-1)}
                        style={{
                          background: hover === i ? '#ff4848' : 'inherit',
                        }}
                        key={i}
                      >
                        {country}
                      </span>
                      {i < (value as string[]).length - 1 && (
                        <span>{' \u2022 '}</span>
                      )}
                    </>
                  ))}
                </div>
                <div>
                  <Button onClick={() => setShowCountriesModal(true)}>
                    <FontAwesomeIcon icon={solid('up-right-from-square')} />
                  </Button>
                  <CountriesAdminModal
                    onHide={() => setShowCountriesModal(false)}
                    countries={bundle.coverage}
                    show={showCountriesModal}
                  />
                </div>
              </div>
            );
          },
        },
        {
          title: 'Refills',
          value: bundle.refills,
          type: 'text',
          RenderData: (): ReactNode => <Refills refills={bundle.refills} />,
        },
      ],
    },
  ];

  const handleBundleDelete = async () => {
    try {
      await adminApi.callApi<Bundle, 'delete'>({
        method: 'DELETE',
        model: 'Bundle',
        input: {
          where: {
            id: bundle.id,
          },
        },
      });
      onDataChange?.(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Section
          sections={data}
          onDelete={handleBundleDelete}
          setLoading={(value) => setLoading(value)}
        />
      )}
    </div>
  );
};

export default BundleData;
