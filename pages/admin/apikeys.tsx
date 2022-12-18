import { NextPageContext } from 'next';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ApiKey } from '@prisma/client';
import {
  GridColumns,
  GridRowId,
  GridSelectionModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { Spinner } from 'react-bootstrap';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';

type ApiAsAdminTableData = (GridValidRowModel & ApiKey)[];

const ApiKeys = ({ apiKeys }: { apiKeys: ApiAsAdminTableData }) => {
  const [apiKeysRows, setApiKeysRows] = useState<ApiAsAdminTableData>(apiKeys);
  const [addApiKeyLoading, setAddApiKeyLoading] = useState<boolean>(false);
  const [adminApi] = useState<AdminApi>(new AdminApi());

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
    },
    {
      field: 'key',
      headerName: 'Key',
      width: 500,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 150,
    },
  ];

  const handleDeleteRows = async (rows: GridSelectionModel) => {
    try {
      await adminApi.callApi<ApiKey, 'deleteMany'>({
        method: 'DELETE',
        model: 'ApiKey',
        action: AdminApiAction.deleteMany,
        input: {
          where: { id: { in: rows as string[] } },
        },
      });
      setApiKeysRows((oldApiKeys) =>
        oldApiKeys.filter((apiKey) => !rows.includes(apiKey.id))
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

  const addRow = async () => {
    try {
      setAddApiKeyLoading(true);
      const newApiKey = await adminApi.callApi<ApiKey, 'create'>({
        method: 'POST',
        model: 'ApiKey',
        input: {
          data: { key: '' },
        },
      });
      setApiKeysRows((oldApiKeys) => [...oldApiKeys, newApiKey]);
      return { id: newApiKey.id, columnToFocus: undefined };
    } catch (e) {
      console.error(e);
      return { id: '', columnToFocus: undefined };
    } finally {
      setAddApiKeyLoading(false);
    }
  };

  return (
    <AdminLayout>
      {addApiKeyLoading && <Spinner animation={'border'} />}
      <AdminTable
        columns={columns}
        data={apiKeysRows}
        deleteRows={handleDeleteRows}
        deleteRow={handleDeleteRow}
        addRow={addRow}
        multiActions={['add', 'delete']}
        rowActions={['delete']}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const apiKeys = await prisma.apiKey.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
  const serializedApiKeys = apiKeys.map((apiKey) => ({
    ...apiKey,
    key: '********',
    createdAt: format(apiKey.createdAt, 'dd/MM/yy kk:mm'),
  }));
  return {
    props: {
      apiKeys: serializedApiKeys,
    },
  };
}

export default ApiKeys;
