import React, { ReactElement, useEffect } from 'react';
import {
  GridActionsCellItem,
  GridActionsCellItemProps,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

type RowActionsProps<T extends GridValidRowModel> = {
  rowModesModel: GridRowModesModel;
  row: GridRowModel<T>;
  rowsActions: string[];
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
  setRows: React.Dispatch<React.SetStateAction<GridRowModel<T>[]>>;
  rows: GridRowModel<T>[];
};

const RowActions = <T extends GridValidRowModel>({
  rowModesModel,
  row,
  rowsActions,
  setRowModesModel,
  setRows,
  rows,
}: RowActionsProps<T>): ReactElement<GridActionsCellItemProps>[] => {
  const [id] = React.useState<GridRowId>(row.id);
  const [inEditMode, setInEditMode] = React.useState<boolean>(false);
  const actions: string[] | ReactElement<GridActionsCellItemProps>[] = [
    ...rowsActions,
  ];

  useEffect(() => {
    setInEditMode(
      rowModesModel[(id as unknown) as GridRowId]?.mode === GridRowModes.Edit
    );
  }, [rowModesModel, id]);

  const handleEditClick = (rowId: string | number) => () => {
    setRowModesModel({
      ...rowModesModel,
      [(rowId as unknown) as GridRowId]: { mode: GridRowModes.Edit },
    });
  };

  const handleSaveClick = (rowId: GridRowParams) => () => {
    setRowModesModel({
      ...rowModesModel,
      [(rowId as unknown) as GridRowId]: { mode: GridRowModes.View },
    });
  };

  const handleDeleteClick = (rowId: string | number) => () => {
    setRows(rows.filter((rowToDelete) => rowToDelete.id !== rowId));
  };

  const handleCancelClick = (rowId: GridRowParams<T>) => () => {
    setRowModesModel({
      ...rowModesModel,
      [(rowId as unknown) as GridRowId]: {
        mode: GridRowModes.View,
        ignoreModifications: true,
      },
    });

    const editedRow = rows.find(
      (rowEdited: GridRowModel<T>) => rowEdited.id === id
    );
    if (editedRow?.isNew) {
      setRows(rows.filter((newRow: GridRowModel<T>) => newRow.id !== id));
    }
  };

  if (inEditMode) {
    return [
      <GridActionsCellItem
        label={'שמור'}
        icon={<FontAwesomeIcon icon={solid('floppy-disk')} />}
        onClick={handleSaveClick((id as unknown) as GridRowParams)}
      />,
      <GridActionsCellItem
        label={'בטל'}
        icon={<FontAwesomeIcon icon={solid('xmark')} />}
        onClick={handleCancelClick((id as unknown) as GridRowParams)}
      />,
    ];
  }

  const saveCell = (
    <GridActionsCellItem
      label={'שמור'}
      icon={<FontAwesomeIcon icon={solid('floppy-disk')} />}
      onClick={handleSaveClick((id as unknown) as GridRowParams)}
    />
  );

  const cancelCell = (
    <GridActionsCellItem
      label={'בטל'}
      icon={<FontAwesomeIcon icon={solid('xmark')} />}
      onClick={handleCancelClick((id as unknown) as GridRowParams)}
    />
  );

  const editCell = (
    <GridActionsCellItem
      label={'ערוך'}
      icon={<FontAwesomeIcon icon={solid('pen')} />}
      onClick={handleEditClick(id)}
    />
  );

  const deleteCell = (
    <GridActionsCellItem
      label={'מחק'}
      icon={<FontAwesomeIcon icon={solid('trash')} />}
      onClick={handleDeleteClick(id)}
    />
  );

  const elements: ReactElement<GridActionsCellItemProps>[] = [];
  if (inEditMode) {
    elements.length = 0;
    elements[0] = saveCell;
    elements[1] = cancelCell;
  } else {
    const indexOfEdit = actions.indexOf('edit');
    if (indexOfEdit !== -1) {
      elements[indexOfEdit] = editCell;
    }

    const indexOfDelete = actions.indexOf('delete');
    if (indexOfDelete !== -1) {
      elements[indexOfDelete] = deleteCell;
    }
  }

  return elements;
};

export default RowActions;
