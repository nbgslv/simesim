import React from 'react';
import { render } from '@testing-library/react';
import { DataGrid } from '@mui/x-data-grid';
import AdminTable from '../../../components/AdminTable/AdminTable';

jest.mock('@mui/x-data-grid/DataGrid', () => ({
  ...jest.requireActual('@mui/x-data-grid/DataGrid'),
  DataGrid: jest.fn(() => <div data-test-id="data-grid" />),
}));

const mockedDataGrid = jest.mocked(DataGrid);

describe('AdminTable', () => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'age', headerName: 'Age', type: 'number', width: 90 },
  ];
  const rows = [
    { id: 1, name: 'John Smith', age: 35 },
    { id: 2, name: 'Jane Doe', age: 25 },
    { id: 3, name: 'Bob Johnson', age: 45 },
  ];

  it('renders basic table without errors', () => {
    render(<AdminTable data={rows} columns={columns} disableVirtualization />);
  });

  it('displays table rows and columns', () => {
    render(<AdminTable disableVirtualization data={rows} columns={columns} />);
    expect(mockedDataGrid).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rows: expect.arrayContaining(rows),
        columns: expect.arrayContaining(columns),
      }),
      {}
    );
  });
  //
  // it('invokes handleRowsSelection when a row is selected', () => {
  //   const { getAllByRole } = render(
  //     <AdminTable
  //       data={rows}
  //       columns={columns}
  //       handleRowsSelection={handleRowsSelection}
  //     />
  //   );
  //   const row = getAllByRole('row')[1];
  //   fireEvent.click(row);
  //   expect(handleRowsSelection).toHaveBeenCalledWith([2]);
  // });
  //
  // it('invokes addRow when the add action is clicked', async () => {
  //   const { getByRole } = render(
  //     <AdminTable
  //       data={rows}
  //       columns={columns}
  //       addRow={addRow}
  //       multiActions={multiActions}
  //     />
  //   );
  //   const addButton = getByRole('button', { name: /add/i });
  //   fireEvent.click(addButton);
  //   await waitFor(() => expect(addRow).toHaveBeenCalled());
  // });
  //
  // it('invokes deleteRows when the delete action is clicked', async () => {
  //   const { getByRole } = render(
  //     <AdminTable
  //       data={rows}
  //       columns={columns}
  //       deleteRows={deleteRows}
  //       multiActions={multiActions}
  //     />
  //   );
  //   const deleteButton = getByRole('button', { name: /delete/i });
  //   fireEvent.click(deleteButton);
  //   await waitFor(() => expect(deleteRows).toHaveBeenCalled());
  // });
});
