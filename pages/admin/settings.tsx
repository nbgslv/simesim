import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { Settings } from '@prisma/client';
import { format } from 'date-fns';
import { NextPageContext } from 'next';
import React, { useState } from 'react';
import AdminTable from '../../components/AdminTable/AdminTable';
import FormModal from '../../components/AdminTable/FormModal';
import AdminLayout from '../../components/Layouts/AdminLayout';
import prisma from '../../lib/prisma';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import { verifyAdmin } from '../../utils/auth';
import SettingsForm from '../../components/Settings/SettingsForm';

type SettingsAsAdminTableData = (GridValidRowModel & Settings)[];

type SettingsProps = {
  settings: SettingsAsAdminTableData;
};

const SettingsPage = ({ settings }: SettingsProps) => {
  const [settingsRows, setSettingsRows] = useState<SettingsAsAdminTableData>(
    settings
  );
  const [addRowLoading, setAddRowLoading] = useState<boolean>(false);
  const [adminApi] = useState<AdminApi>(new AdminApi());
  const modal = useModal('add-settings');

  const handleRowUpdate = async (
    rowId: GridRowId,
    updatedData: Partial<Settings>
  ): Promise<Settings> => {
    const update = await adminApi.callApi<Settings, 'update'>({
      method: 'PUT',
      model: 'Settings',
      input: {
        where: { id: rowId as string },
        data: updatedData,
      },
    });
    setSettingsRows((oldSettings) =>
      oldSettings.map((setting) => (setting.id === rowId ? update : setting))
    );
    return update;
  };

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
    },
    {
      field: 'name',
      headerName: 'Name',
      editable: true,
    },
    {
      field: 'value',
      headerName: 'Value',
      editable: true,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
    },
  ];

  const handleDeleteRows = async (ids: GridRowId[]) => {
    await adminApi.callApi<Settings, 'deleteMany'>({
      method: 'DELETE',
      action: AdminApiAction.deleteMany,
      model: 'Settings',
      input: {
        where: {
          id: {
            in: ids as string[],
          },
        },
      },
    });
    setSettingsRows(
      settingsRows.filter((setting) => !ids.includes(setting.id!))
    );
  };

  const handleDeleteRow = async (id: GridRowId) => {
    await handleDeleteRows([id]);
  };

  const addRow = async (
    data: Settings
  ): Promise<{ id: string; columnToFocus: undefined }> => {
    setAddRowLoading(true);
    const newSetting = await adminApi.callApi<Settings, 'create'>({
      method: 'POST',
      model: 'Settings',
      input: {
        data,
      },
    });
    setSettingsRows([...settingsRows, newSetting]);
    setAddRowLoading(false);
    return { id: newSetting.id, columnToFocus: undefined };
  };

  const showModal = async (): Promise<
    { id: string; columnToFocus: undefined } | Error
  > => {
    try {
      const addData = await NiceModal.show('add-settings');
      return await addRow(addData as Settings);
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      await modal.hide();
      modal.remove();
    }
  };

  return (
    <AdminLayout title="Settings">
      <AdminTable
        data={settingsRows}
        columns={columns}
        addRow={showModal}
        deleteRows={handleDeleteRows}
        processRowUpdate={handleRowUpdate}
        deleteRow={handleDeleteRow}
      />
      <FormModal
        id="add-settings"
        {...bootstrapDialog(modal)}
        header={'Add Setting'}
      >
        <SettingsForm loading={addRowLoading} />
      </FormModal>
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const settings = await prisma.settings.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  const serializedSettings = settings.map((setting) => ({
    ...setting,
    createdAt: format(setting.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(setting.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  return {
    props: {
      settings: serializedSettings,
    },
  };
}

export default SettingsPage;
