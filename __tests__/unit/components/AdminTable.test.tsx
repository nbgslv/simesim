import React from 'react';
import { render } from '@testing-library/react';
import { DataGrid, GridColumns, GridRowModel } from '@mui/x-data-grid';
import AdminTable from '../../../components/AdminTable/AdminTable';

const handleRowsSelection = jest.fn((ids) => ids);

jest.mock('@mui/x-data-grid/DataGrid', () => ({
  ...jest.requireActual('@mui/x-data-grid/DataGrid'),
  DataGrid: jest.fn(
    ({
      rows,
      columns,
    }: {
      rows: GridRowModel[];
      columns: GridColumns<any>;
    }) => (
      <table>
        <thead>
          <tr>
            <th />
            {columns.map((column) => (
              <th key={column.field}>{column.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  type="checkbox"
                  onClick={() => jest.fn(() => handleRowsSelection([row.id]))}
                />
              </td>
              {columns.map((column) => (
                <td key={column.field}>{row[column.field]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  ),
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

  it('matches snapshot', () => {
    const { container } = render(
      <AdminTable
        disableVirtualization
        rowActions={[]}
        data={rows}
        columns={columns}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders basic table without errors', () => {
    render(
      <AdminTable
        disableVirtualization
        rowActions={[]}
        data={rows}
        columns={columns}
      />
    );
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

  it('should display title', () => {
    const { getByText } = render(
      <AdminTable
        disableVirtualization
        title="Test Title"
        data={rows}
        columns={columns}
      />
    );
    expect(getByText('Test Title')).toBeInTheDocument();
  });
});
