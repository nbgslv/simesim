import React, { useCallback, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Prisma } from '@prisma/client';
import {
  GridColumns,
  GridRowId,
  GridRowModel,
  GridSelectionModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import AdminTableSwitch from '../../components/AdminTable/AdminTableSwitch';

type CountriesAsAdminTableData = (GridValidRowModel &
  Prisma.CountryMaxAggregateOutputType)[];

const Countries = ({ countries }: { countries: CountriesAsAdminTableData }) => {
  const [
    countriesRows,
    setCountriesRows,
  ] = React.useState<CountriesAsAdminTableData>(countries);
  const [changeShowLoading, setChangeShowLoading] = React.useState<GridRowId>(
    ''
  );
  const [
    changeLockTranslationLoading,
    setChangeLockTranslationLoading,
  ] = React.useState<GridRowId>('');

  useEffect(() => {
    setCountriesRows(countries);
  }, [countries]);

  const updateRow = useCallback(
    async (data: BodyInit) =>
      fetch('/api/country', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
    [changeShowLoading, changeLockTranslationLoading]
  );

  const handleLockTranslationToggle = async (
    checked: boolean,
    rowId: GridRowId,
    row: GridRowModel<Prisma.CountryMaxAggregateOutputType>
  ) => {
    try {
      setChangeLockTranslationLoading(rowId);
      const update = await updateRow(
        JSON.stringify({
          ...row,
          lockTranslation: checked,
          id: row.id,
        })
      );
      const updateJson = await update.json();
      const serializedUpdate = { ...updateJson };
      serializedUpdate.createdAt = format(
        parseISO(serializedUpdate.createdAt),
        'dd/MM/yy kk:mm'
      );
      serializedUpdate.updatedAt = format(
        parseISO(serializedUpdate.updatedAt),
        'dd/MM/yy kk:mm'
      );
      setCountriesRows((oldCountries) =>
        oldCountries.map((country) =>
          country.id === rowId ? serializedUpdate : country
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setChangeLockTranslationLoading('');
    }
  };

  const handleShowToggle = async (
    checked: boolean,
    rowId: GridRowId,
    row: GridRowModel<Prisma.CountryMaxAggregateOutputType>
  ) => {
    try {
      setChangeShowLoading(rowId);
      const update = await updateRow(
        JSON.stringify({
          ...row,
          show: checked,
          id: row.id,
        })
      );
      const updateJson = await update.json();
      const serializedUpdate = { ...updateJson };
      serializedUpdate.createdAt = format(
        parseISO(serializedUpdate.createdAt),
        'dd/MM/yy kk:mm'
      );
      serializedUpdate.updatedAt = format(
        parseISO(serializedUpdate.updatedAt),
        'dd/MM/yy kk:mm'
      );
      setCountriesRows((oldCountries) =>
        oldCountries.map((country) =>
          country.id === rowId ? serializedUpdate : country
        )
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
      width: 200,
    },
    {
      field: 'translation',
      headerName: 'Translation',
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
    newRow: GridRowModel<Prisma.CountryMaxAggregateOutputType>,
    oldRow: GridRowModel<Prisma.CountryMaxAggregateOutputType>
  ) => {
    try {
      const update = await updateRow(
        JSON.stringify({
          ...newRow,
          id: oldRow.id,
        })
      );
      const updateJson = await update.json();
      const serializedUpdate = { ...updateJson };
      serializedUpdate.createdAt = format(
        parseISO(serializedUpdate.createdAt),
        'dd/MM/yy kk:mm'
      );
      serializedUpdate.updatedAt = format(
        parseISO(serializedUpdate.updatedAt),
        'dd/MM/yy kk:mm'
      );
      return serializedUpdate;
    } catch (e) {
      console.error(e);
      return oldRow;
    }
  };

  const handleRowsDelete = async (rows: GridSelectionModel) => {
    try {
      const deleteRes = await fetch('/api/country', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Array.from(rows.keys()),
        }),
      });
      const deleteJson = await deleteRes.json();
      return deleteJson.count;
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  return (
    <AdminLayout>
      <AdminTable
        columns={columns}
        data={countriesRows}
        processRowUpdate={handleRowUpdate}
        onDelete={handleRowsDelete}
        rowActions={[]}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps() {
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
