import { NextPageContext } from 'next';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Country } from '@prisma/client';
import {
  GridCellParams,
  GridColumns,
  GridRowId,
  GridSelectionModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { Tooltip } from '@mui/material';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import AdminTableSwitch from '../../components/AdminTable/AdminTableSwitch';
import { verifyAdmin } from '../../utils/auth';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import CountriesForm from '../../components/Countries/CountriesForm';
import FormModal from '../../components/AdminTable/FormModal';
import styles from '../../styles/bundles.module.scss';

type CountriesAsAdminTableData = (GridValidRowModel & Country)[];

const Countries = ({ countries }: { countries: CountriesAsAdminTableData }) => {
  const [countriesRows, setCountriesRows] = useState<CountriesAsAdminTableData>(
    countries
  );
  const [addCountryLoading, setAddCountryLoading] = useState<boolean>(false);
  const [changeShowLoading, setChangeShowLoading] = useState<GridRowId>('');
  const [
    changeLockTranslationLoading,
    setChangeLockTranslationLoading,
  ] = useState<GridRowId>('');
  const [adminApi] = useState<AdminApi>(new AdminApi());
  const modal = useModal('add-country');

  useEffect(() => {
    setCountriesRows(countries);
  }, [countries]);

  const updateRow = async (data: Partial<Country>) =>
    adminApi.callApi<Country, 'update'>({
      method: 'PUT',
      model: 'Country',
      input: {
        where: {
          id: data.id,
        },
        data,
      },
    });

  const handleLockTranslationToggle = async (
    checked: boolean,
    rowId: GridRowId
  ) => {
    try {
      setChangeLockTranslationLoading(rowId);
      const update = await updateRow({
        lockTranslation: checked,
        id: rowId as string,
      });
      setCountriesRows((oldCountries) =>
        oldCountries.map((country) => (country.id === rowId ? update : country))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setChangeLockTranslationLoading('');
    }
  };

  const handleShowToggle = async (checked: boolean, rowId: GridRowId) => {
    try {
      setChangeShowLoading(rowId);
      const update = await updateRow({
        show: checked,
        id: rowId as string,
      });
      setCountriesRows((oldCountries) =>
        oldCountries.map((country) => (country.id === rowId ? update : country))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setChangeShowLoading('');
    }
  };

  const columns: GridColumns = [
    {
      field: 'name',
      headerName: 'Country',
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.value}>
          <span className={styles.tooltip}>{params.value}</span>
        </Tooltip>
      ),
      width: 200,
    },
    {
      field: 'translation',
      headerName: 'Translation',
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.value}>
          <span className={styles.tooltip}>{params.value}</span>
        </Tooltip>
      ),
      editable: true,
      width: 200,
    },
    {
      field: 'lockTranslation',
      headerName: 'Lock Translation',
      renderCell: (params: any) => (
        <AdminTableSwitch
          checked={params.value}
          onChange={handleLockTranslationToggle}
          rowId={params.id}
          row={params.row}
          loading={changeLockTranslationLoading}
        />
      ),
    },
    {
      field: 'show',
      headerName: 'Show',
      renderCell: (params: any) => (
        <AdminTableSwitch
          checked={params.value}
          onChange={handleShowToggle}
          rowId={params.id}
          row={params.row}
          loading={changeShowLoading}
        />
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      width: 150,
    },
  ];

  const handleRowUpdate = async (
    rowId: GridRowId,
    updatedData: Partial<Country>
  ): Promise<Country> => {
    const update = await adminApi.callApi<Country, 'update'>({
      method: 'PUT',
      model: 'Country',
      input: {
        where: { id: rowId as string },
        data: updatedData,
      },
    });
    setCountriesRows((oldCountries) =>
      oldCountries.map((country) => (country.id === rowId ? update : country))
    );
    return update;
  };

  const handleDeleteRows = async (rows: GridSelectionModel) => {
    try {
      await adminApi.callApi<Country, 'deleteMany'>({
        method: 'DELETE',
        model: 'Country',
        action: AdminApiAction.deleteMany,
        input: {
          where: { id: { in: rows as string[] } },
        },
      });
      setCountriesRows((oldCountries) =>
        oldCountries.filter((country) => !rows.includes(country.id))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRow = async (id: GridRowId) => {
    try {
      await handleDeleteRows([id]);
    } catch (error) {
      console.error(error);
    }
  };

  const addRow = async (newRow: Country) => {
    try {
      setAddCountryLoading(true);
      const newCountry = await adminApi.callApi<Country, 'create'>({
        method: 'POST',
        model: 'Country',
        input: {
          data: newRow,
        },
      });
      setCountriesRows((oldCountries) => [...oldCountries, newCountry]);
      return { id: newCountry.id, columnToFocus: undefined };
    } catch (e) {
      console.error(e);
      return { id: '', columnToFocus: undefined };
    } finally {
      setAddCountryLoading(false);
    }
  };

  const showModal = async (): Promise<
    Error | { id: GridRowId; columnToFocus: string | undefined }
  > => {
    try {
      const addData = await NiceModal.show('add-country');
      return await addRow(addData as Country);
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      await modal.hide();
      modal.remove();
    }
  };

  return (
    <AdminLayout title="Countries">
      <AdminTable<Country>
        columns={columns}
        data={countriesRows}
        processRowUpdate={handleRowUpdate}
        deleteRows={handleDeleteRows}
        deleteRow={handleDeleteRow}
        addRow={showModal}
      />
      <FormModal
        {...bootstrapDialog(modal)}
        header="Add Country"
        id="add-country"
      >
        <CountriesForm loading={addCountryLoading} />
      </FormModal>
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const countries = await prisma.country.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const serializedCountries = countries.map((country) => ({
    ...country,
    createdAt: format(country.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(country.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  return {
    props: {
      countries: serializedCountries,
    },
  };
}

export default Countries;
