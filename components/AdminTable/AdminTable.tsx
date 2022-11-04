import React, {RefObject, useEffect, useMemo, useRef} from 'react';
import {
    DataGrid, GridColumns,
    GridRowId, GridRowsProp, GridSelectionModel,
    GridValidRowModel,
} from '@mui/x-data-grid';
import styles from './AdminTable.module.scss'
import {GridApiCommunity} from "@mui/x-data-grid/internals";
import {Button} from "react-bootstrap";

type AdminTableProps<T extends GridValidRowModel> = {
    data: GridRowsProp<T>;
    title?: string;
    handleRowsSelection?: (ids: GridSelectionModel) => boolean;
    processRowUpdate?: (newRow: T, oldRow: T) => Promise<any>;
    columns: GridColumns;
    actions?: ['delete', 'edit', 'create'];
    limit?: number;
    onDelete?: (rows: Map<GridRowId, GridValidRowModel>, apiRef: RefObject<GridApiCommunity>) => Promise<number>;
}

function useApiRef({ columns }: { columns: any }) {
    const apiRef = useRef<GridApiCommunity>(null);
    const _columns = useMemo(
        () =>
            columns.concat({
                field: "__HIDDEN__",
                width: 0,
                hide: true,
                renderCell: (params: any) => {
                    // @ts-ignore
                    apiRef.current = params.api;
                    return null;
                }
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
    actions = ['delete', 'edit', 'create'],
    limit,
    onDelete
}: AdminTableProps<T>) => {
    const [dataRows, setDataRows] = React.useState<GridRowsProp<T>>(data);
    const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);
    const { apiRef, columns: columnsWithApi }: { apiRef: RefObject<GridApiCommunity>, columns: any } = useApiRef({ columns });

    useEffect(() => {
        if (Array.isArray(selectionModel) && selectionModel.length > 0 && handleRowsSelection) {
            const deselectRows = handleRowsSelection(selectionModel);
            if (deselectRows) {
                setSelectionModel([]);
            }
        }
    }, [selectionModel])

    const handleDelete = async (rows: Map<GridRowId, GridValidRowModel>) => {
        if (onDelete) {
            const deletedCount = await onDelete(rows, apiRef);
            if (deletedCount === rows.size) {
                setDataRows(prevRows => prevRows.filter(row => !rows.has(row.id)));
            }
        }
    }

    return (
        <div className={styles.main}>
            {title && <h2>{title}</h2>}
            {onDelete &&
              <Button
                onClick={() => handleDelete(apiRef.current!.getSelectedRows())}
                disabled={selectionModel.length === 0}
              >
                מחק
              </Button>
            }
            <div className={styles.table} dir="ltr">
                <DataGrid
                    pagination
                    columns={columnsWithApi}
                    rows={dataRows}
                    processRowUpdate={processRowUpdate}
                    checkboxSelection
                    disableSelectionOnClick
                    selectionModel={selectionModel}
                    onSelectionModelChange={(newSelectionModel) => setSelectionModel(newSelectionModel)}
                    experimentalFeatures={{ newEditingApi: true }}
                />
            </div>
        </div>
    );
};

export default AdminTable;
