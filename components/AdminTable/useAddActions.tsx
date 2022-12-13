import React, { useMemo } from 'react';
import {
  GridColumns,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import RowActions from './RowActions';

type RowActionsProps<T extends GridValidRowModel> = {
  columns: GridColumns;
  rowModesModel: GridRowModesModel;
  rowsActions: string[];
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  setRows: React.Dispatch<React.SetStateAction<GridRowModel<T>[]>>;
  rows: GridRowModel<T>[];
  onDelete?: (id: GridRowId) => Promise<boolean>;
};

const useAddActions = <T extends GridValidRowModel>({
  columns,
  rowsActions,
  rowModesModel,
  setRowModesModel,
  setRows,
  rows,
  onDelete,
}: RowActionsProps<T>) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
  const _columns = useMemo(
    () =>
      columns.concat({
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        getActions: (row) => [
          <>
            {/* @ts-ignore */}
            <RowActions
              rowsActions={rowsActions}
              row={(row as unknown) as GridRowModel<T>}
              rowModesModel={rowModesModel}
              setRowModesModel={setRowModesModel}
              setRows={setRows}
              rows={rows}
              onDelete={onDelete}
            />
          </>,
        ],
      }),
    [columns, rowsActions, rowModesModel, setRowModesModel, setRows, rows]
  );

  return { columns: _columns };
};

export default useAddActions;
