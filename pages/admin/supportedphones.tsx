import { NextPageContext } from 'next';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PhoneBrand, SupportedPhones } from '@prisma/client';
import {
  GridColumns,
  GridRowId,
  GridSelectionModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';
// eslint-disable-next-line import/no-cycle
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import FormModal from '../../components/AdminTable/FormModal';
import SupportedPhonesForm from '../../components/SupportedPhones/SupportedPhonesForm';
import AdminSelect from '../../components/AdminSelect/AdminSelect';
import PhoneBrandAdminModal from '../../components/PhoneBrand/PhoneBrandAdminModal';

type SupportedPhonesAsAdminTableData = (GridValidRowModel & SupportedPhones)[];

const Countries = ({
  supportedPhones,
  brands,
}: {
  supportedPhones: SupportedPhonesAsAdminTableData;
  brands: PhoneBrand[];
}) => {
  const [
    supportedPhonesRows,
    setSupportedPhonesRows,
  ] = useState<SupportedPhonesAsAdminTableData>(supportedPhones);
  const [
    addSupportedPhoneLoading,
    setAddSupportedPhoneLoading,
  ] = useState<boolean>(false);
  const [brandData, setBrandData] = useState<PhoneBrand | null>(null);
  const [adminApi] = useState<AdminApi>(new AdminApi());
  const modal = useModal('add-supported-phone');

  useEffect(() => {
    setSupportedPhonesRows(supportedPhones);
  }, [supportedPhones]);

  const columns: GridColumns = [
    {
      field: 'phoneModel',
      headerName: 'Model',
      editable: true,
      width: 250,
    },
    {
      field: 'brand',
      headerName: 'Brand Name',
      valueFormatter: ({ value }) => value.name,
      width: 150,
    },
    {
      field: 'brandId',
      headerName: 'Brand',
      renderCell: (params: any) => (
        <Button onClick={() => setBrandData(params.row.brand)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      editable: true,
      renderEditCell: (params) => (
        <AdminSelect
          ariaLabel="select brand"
          options={brands.map((brand) => ({
            value: brand.id,
            label: brand.name,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={{
            value: params.value,
            label:
              brands.find((brand) => brand.id === params.value)?.name || 'Err',
          }}
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
    updatedData: Partial<SupportedPhones>
  ): Promise<SupportedPhones> => {
    const update = await adminApi.callApi<
      SupportedPhones,
      'update',
      {
        include: {
          brand: {
            select: {
              id: true;
              name: true;
              exceptions: true;
            };
          };
        };
      }
    >({
      method: 'PUT',
      model: 'SupportedPhones',
      input: {
        where: { id: rowId as string },
        data: updatedData,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              exceptions: true,
            },
          },
        },
      },
    });
    setSupportedPhonesRows((oldSupportedPhones) =>
      oldSupportedPhones.map((supportedPhone) =>
        supportedPhone.id === rowId ? update : supportedPhone
      )
    );
    return update;
  };

  const handleDeleteRows = async (rows: GridSelectionModel) => {
    try {
      await adminApi.callApi<SupportedPhones, 'deleteMany'>({
        method: 'DELETE',
        model: 'SupportedPhones',
        action: AdminApiAction.deleteMany,
        input: {
          where: { id: { in: rows as string[] } },
        },
      });
      setSupportedPhonesRows((oldSupportedPhones) =>
        oldSupportedPhones.filter(
          (supportedPhone) => !rows.includes(supportedPhone.id)
        )
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

  const addRow = async (newRow: SupportedPhones) => {
    try {
      setAddSupportedPhoneLoading(true);
      const newSupportedPhone = await adminApi.callApi<
        SupportedPhones,
        'create',
        {
          include: {
            brand: {
              select: {
                id: true;
                name: true;
                exceptions: true;
              };
            };
          };
        }
      >({
        method: 'POST',
        model: 'SupportedPhones',
        input: {
          data: newRow,
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                exceptions: true,
              },
            },
          },
        },
      });
      setSupportedPhonesRows((oldSupportedPhone) => [
        ...oldSupportedPhone,
        newSupportedPhone,
      ]);
      return { id: newSupportedPhone.id, columnToFocus: undefined };
    } catch (e) {
      console.error(e);
      return { id: '', columnToFocus: undefined };
    }
  };

  const showModal = async (): Promise<
    Error | { id: GridRowId; columnToFocus: string | undefined }
  > => {
    try {
      const addData = await NiceModal.show('add-supported-phone');
      return await addRow(addData as SupportedPhones);
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      setAddSupportedPhoneLoading(false);
      await modal.hide();
      modal.remove();
    }
  };

  return (
    <AdminLayout title="Supported Phones">
      <AdminTable<SupportedPhones>
        columns={columns}
        data={supportedPhonesRows}
        processRowUpdate={handleRowUpdate}
        deleteRows={handleDeleteRows}
        deleteRow={handleDeleteRow}
        addRow={showModal}
      />
      <FormModal
        {...bootstrapDialog(modal)}
        header="Add Supported Phone"
        id="add-supported-phone"
      >
        <SupportedPhonesForm
          brands={brands}
          loading={addSupportedPhoneLoading}
        />
      </FormModal>
      <PhoneBrandAdminModal
        onHide={() => setBrandData(null)}
        brand={brandData}
        show={!!brandData}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const supportedPhone = await prisma.supportedPhones.findMany({
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          exceptions: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const serializedSupportedPhones = supportedPhone.map(
    (supportedPhoneInSupportedPhones) => ({
      ...supportedPhoneInSupportedPhones,
      createdAt: format(
        supportedPhoneInSupportedPhones.createdAt,
        'dd/MM/yy kk:mm'
      ),
      updatedAt: format(
        supportedPhoneInSupportedPhones.updatedAt,
        'dd/MM/yy kk:mm'
      ),
    })
  );
  const brands = await prisma.phoneBrand.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  return {
    props: {
      supportedPhones: serializedSupportedPhones,
      brands,
    },
  };
}

export default Countries;
