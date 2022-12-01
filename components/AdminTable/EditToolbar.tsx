import React from 'react';
import {
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import styles from './EditToolbar.module.scss';
import ConfirmationModal from './ConfirmationModal';

interface EditToolbarProps {
  selectedRows: GridRowId[];
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
  multiActions?: string[];
  addRow?: () => Promise<
    { id: GridRowId; columnToFocus: string | undefined } | Error
  >;
  deleteRows?: (ids: GridRowId[]) => Promise<void>;
  loading: boolean;
}

const EditToolbar = ({
  selectedRows,
  setRowModesModel,
  multiActions = [],
  addRow,
  deleteRows,
}: EditToolbarProps) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      if (addRow) {
        const newRowData = await addRow();
        if (!(newRowData instanceof Error) && newRowData) {
          setRowModesModel((oldModel) => ({
            ...oldModel,
            [newRowData.id]: {
              mode: GridRowModes.Edit,
              fieldToFocus: newRowData.columnToFocus,
            },
          }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    await deleteRows?.(selectedRows);
    setLoading(false);
  };

  return (
    <div dir="rtl" className="position-relative">
      {loading && (
        <div className={styles.spinner}>
          <Spinner animation={'border'} />
        </div>
      )}
      <GridToolbarContainer>
        {multiActions?.includes('add') && (
          <Button className={styles.button} onClick={handleAdd}>
            <FontAwesomeIcon icon={solid('plus')} />
            חדש
          </Button>
        )}
        {multiActions?.includes('delete') && (
          <Button
            className={styles.button}
            disabled={!selectedRows.length}
            onClick={() => setShowDeleteModal(true)}
          >
            <FontAwesomeIcon icon={solid('trash-can')} />
            מחק
          </Button>
        )}
      </GridToolbarContainer>
      <ConfirmationModal
        show={showDeleteModal}
        title={'מחיקה'}
        body={'בטוח שברצונך למחוק?'}
        confirmButtonText={'כן'}
        cancelButtonText={'לא'}
        confirmAction={handleDelete}
        cancelAction={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default EditToolbar;
