import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import React, { RefObject, useEffect, useMemo, useRef } from 'react';
import {
  DataGrid,
  GridColumns,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
  GridRowParams,
  GridSelectionModel,
  GridValidRowModel,
  MuiEvent,
} from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import {
  differenceWith,
  toPairs,
  fromPairs,
  isEqual,
  Dictionary,
} from 'lodash';
import styles from './AdminTable.module.scss';
import AsyncConfirmationModal from './AsyncConfirmationModal';
import EditToolbar from './EditToolbar';
import useAddActions from './useAddActions';

type AdminTableProps<T extends GridValidRowModel> = {
  data: GridRowModel<T>[];
  title?: string;
  handleRowsSelection?: (ids: GridSelectionModel) => boolean;
  processRowUpdate?: (
    rowId: GridRowId,
    updatedValues: Dictionary<T>
  ) => Promise<T>;
  columns: GridColumns;
  multiActions?: string[];
  rowActions?: string[];
  limit?: number;
  editMode?: 'row' | 'cell';
  addRow?: () => Promise<
    { id: GridRowId; columnToFocus: string | undefined } | undefined | Error
  >;
  onDelete?: (ids: GridSelectionModel) => Promise<{ ids: GridSelectionModel }>;
  deleteRows?: (ids: GridRowId[]) => Promise<void>;
  deleteRow?: (id: GridRowId) => Promise<void>;
};

function useApiRef({ columns }: { columns: any }) {
  const apiRef = useRef<GridApiCommunity>(null);
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
  const _columns = useMemo(
    () =>
      columns.concat({
        field: '__HIDDEN__',
        width: 0,
        hide: true,
        renderCell: (params: any) => {
          // @ts-ignore
          apiRef.current = params.api;
          return null;
        },
      }),
    [columns]
  );

  return { apiRef, columns: _columns };
}

const AdminTable = <T extends GridValidRowModel>({
  data,
  title,
  handleRowsSelection,
  processRowUpdate,
  columns,
  multiActions = ['delete', 'add'],
  rowActions = ['delete', 'edit'],
  limit = 15,
  editMode = 'cell',
  addRow,
  deleteRows,
  deleteRow,
}: AdminTableProps<T>) => {
  const [dataRows, setDataRows] = React.useState<GridRowModel<T>[]>(data);
  const [
    selectionModel,
    setSelectionModel,
  ] = React.useState<GridSelectionModel>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const {
    columns: columnsWithApi,
  }: { apiRef: RefObject<GridApiCommunity>; columns: GridColumns } = useApiRef({
    columns,
  });
  const modal = useModal('delete-modal-admin-table');

  const processRowDelete = async (id: GridRowId) => {
    try {
      const deleteModal = await NiceModal.show('delete-modal-admin-table');
      if (deleteModal) {
        await deleteRow?.(id);
        setDataRows(dataRows.filter((row) => row.id !== id));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      await modal.hide();
    }
  };

  const {
    columns: columnsWithActions,
  }: { columns: GridColumns } = useAddActions({
    columns: columnsWithApi,
    rowsActions: rowActions,
    rowModesModel,
    setRowModesModel,
    setRows: setDataRows,
    rows: dataRows,
    onDelete: (id: GridRowId) => processRowDelete(id),
  });

  useEffect(() => {
    setDataRows(data);
  }, [data]);

  useEffect(() => {
    if (
      Array.isArray(selectionModel) &&
      selectionModel.length > 0 &&
      handleRowsSelection
    ) {
      const deselectRows = handleRowsSelection(selectionModel);
      if (deselectRows) {
        setSelectionModel([]);
      }
    }
  }, [selectionModel]);

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>
  ) => {
    // eslint-disable-next-line no-param-reassign
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    // eslint-disable-next-line no-param-reassign
    event.defaultMuiPrevented = true;
  };

  const handleProcessRowUpdate = async (newRow: T, oldRow: T) =>
    processRowUpdate?.(
      newRow.id,
      fromPairs(differenceWith(toPairs(newRow), toPairs(oldRow), isEqual))
    ) ?? oldRow;

  return (
    <div className={styles.main}>
      {title && <h2>{title}</h2>}
      <div className={styles.table} dir="ltr">
        <DataGrid
          pageSize={limit}
          pagination
          columns={rowActions.length ? columnsWithActions : columnsWithApi}
          rows={dataRows}
          processRowUpdate={handleProcessRowUpdate}
          checkboxSelection
          disableSelectionOnClick
          selectionModel={selectionModel}
          onSelectionModelChange={(newSelectionModel) =>
            setSelectionModel(newSelectionModel)
          }
          editMode={editMode}
          rowModesModel={rowModesModel}
          onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          components={{
            Toolbar: multiActions.length ? EditToolbar : null,
          }}
          componentsProps={{
            toolbar: {
              selectedRows: selectionModel,
              setRows: setDataRows,
              setRowModesModel,
              multiActions,
              addRow,
              deleteRows,
            },
          }}
          experimentalFeatures={{ newEditingApi: true }}
        />
      </div>
      <AsyncConfirmationModal
        id="delete-modal-admin-table"
        title={'Delete'}
        body={
          'Are you sure you want to delete this? All the related data will be deleted.'
        }
        confirmAction={() => deleteRows?.(selectionModel as GridRowId[])}
        confirmButtonText={'Delete'}
        cancelButtonText={'Cancel'}
        {...bootstrapDialog(modal)}
      />
      <AsyncConfirmationModal
        id="delete-modal-admin-table"
        title={'Delete'}
        body={
          'Are you sure you want to delete this? All the related data will be deleted.'
        }
        cancelAction={() => {
          modal.hide();
        }}
        confirmButtonText={'Delete'}
        cancelButtonText={'Cancel'}
        {...bootstrapDialog(modal)}
      />
    </div>
  );
};

export default AdminTable;
