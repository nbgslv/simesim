import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import EditToolbar from '../../../components/AdminTable/EditToolbar';

jest.mock('@mui/x-data-grid', () => ({
  GridToolbarContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('EditToolbar', () => {
  const props = {
    selectedRows: [],
    setRows: jest.fn(),
    setRowModesModel: jest.fn(),
    multiActions: ['add', 'delete'],
    addRow: jest.fn().mockResolvedValue({ id: 1, columnToFocus: 'name' }),
    deleteRows: jest.fn(),
    loading: false,
  };

  it('should render correctly', () => {
    const { getByText } = render(<EditToolbar {...props} />);
    expect(getByText('חדש')).toBeInTheDocument();
    expect(getByText('מחק')).toBeInTheDocument();
  });

  it('should call addRow when add button is clicked', async () => {
    const { getByText } = render(<EditToolbar {...props} />);
    fireEvent.click(getByText('חדש'));
    await waitFor(() => expect(props.addRow).toHaveBeenCalled());
    expect(props.setRowModesModel).toHaveBeenCalledWith(expect.any(Function));
    return expect(props.addRow()).resolves.toEqual({
      id: 1,
      columnToFocus: 'name',
    });
  });

  it.skip('should show delete confirmation modal when delete button is clicked', async () => {
    /*
    react-bootstrap's Modal component is not working with react-testing-library
    as it is being rendered into a portal.
    https://github.com/testing-library/react-testing-library/issues/62
    TODO: test when this option is available.
     */
  });

  it.skip('should call deleteRows when delete confirmation modal is confirmed', async () => {
    // TODO: test when react-bootstrap's Modal component is working with react-testing-library
  });
});
