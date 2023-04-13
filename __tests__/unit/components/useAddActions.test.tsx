import { renderHook } from '@testing-library/react';
import { GridRowModesModel } from '@mui/x-data-grid';
import useAddActions from '../../../components/AdminTable/useAddActions';

describe('useAddActions', () => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200 },
  ];
  const rowsActions = ['delete'];
  const rowModesModel = { '1': { mode: 'view' }, '2': { mode: 'view' } };
  const setRowModesModel = jest.fn();
  const setRows = jest.fn();
  const rows = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
  ];
  const onDelete = jest.fn(() => Promise.resolve(true));

  beforeEach(() => {
    setRowModesModel.mockClear();
    setRows.mockClear();
  });

  it('should add an actions column to the columns array', () => {
    const { result } = renderHook(() =>
      useAddActions({
        columns,
        rowsActions,
        rowModesModel: rowModesModel as GridRowModesModel,
        setRowModesModel,
        setRows,
        rows,
        onDelete,
      })
    );
    const newColumns = result.current.columns;
    expect(newColumns).toHaveLength(3);
    expect(newColumns[2].field).toEqual('actions');
  });
});
