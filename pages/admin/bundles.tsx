import { GridCellParams, GridRowId } from '@mui/x-data-grid';
import { NextPageContext } from 'next';
import React from 'react';
import { Bundle, Prisma, Refill } from '@prisma/client';
import { format } from 'date-fns';
import { Button } from 'react-bootstrap';
import CountriesAdminModal from '../../components/Countries/CountriesAdminModal';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import RefillsAdminModal from '../../components/Refills/RefillsAdminModal';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';
import AdminExpandableCell from '../../components/AdminExpandableCell/AdminExpandableCell';

type BundleData = Bundle &
  Prisma.BundleGetPayload<{ select: { refills: true } }>;

type BundleAsAdminTableData = (GridRowId & BundleData)[];
const Bundles = ({ bundlesList }: { bundlesList: BundleAsAdminTableData }) => {
  const [showRefills, setShowRefills] = React.useState<boolean>(false);
  const [refills, setRefills] = React.useState<Refill[]>([]);
  const [showCountries, setShowCountries] = React.useState<boolean>(false);
  const [countries, setCountries] = React.useState<string[]>([]);

  const handleHideRefills = () => {
    setShowRefills(false);
    setRefills([]);
  };

  const handleShowRefills = (bundleId: GridRowId) => {
    setRefills(
      bundlesList.find((bundle) => bundle.id === bundleId)?.refills || []
    );
    setShowRefills(true);
  };

  const handleShowCountries = (bundleId: GridRowId) => {
    setCountries(
      bundlesList.find((bundle) => bundle.id === bundleId)?.coverage || []
    );
    setShowCountries(true);
  };

  const handleHideCountries = () => {
    setShowCountries(false);
    setCountries([]);
  };

  const columns = [
    {
      field: 'externalId',
      headerName: 'External ID',
      width: 50,
    },
    {
      field: 'name',
      headerName: 'Name',
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      renderCell: (params: GridCellParams) => (
        <AdminExpandableCell value={params.value} length={10} />
      ),
    },
    {
      field: 'coverage',
      headerName: 'Coverage',
      renderCell: (params: GridCellParams) => (
        <Button
          style={{ fontSize: '14px' }}
          onClick={() => handleShowCountries(params.id)}
        >
          Show Countries
        </Button>
      ),
      width: 150,
    },
    {
      field: 'refills',
      headerName: 'Refills',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => handleShowRefills(params.id)}>
          Show Refills
        </Button>
      ),
      width: 150,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 150,
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      width: 150,
    },
  ];
  return (
    <AdminLayout title="Bundles">
      <AdminTable
        columns={columns}
        data={bundlesList}
        multiActions={[]}
        rowActions={[]}
      />
      <RefillsAdminModal
        onHide={handleHideRefills}
        refills={refills}
        show={showRefills}
      />
      <CountriesAdminModal
        onHide={handleHideCountries}
        countries={countries}
        show={showCountries}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const bundles = await prisma.bundle.findMany({
    include: {
      refills: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  const serializedBundles = bundles.map((bundle) => ({
    ...bundle,
    refills: bundle.refills.map((refill) => ({
      ...refill,
      createdAt: format(refill.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(refill.updatedAt, 'dd/MM/yy kk:mm'),
    })),
    createdAt: format(bundle.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(bundle.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  return {
    props: {
      bundlesList: serializedBundles,
    },
  };
}

export default Bundles;
