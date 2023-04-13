import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GridRowModel } from '@mui/x-data-grid';
import RowActions from '../../../components/AdminTable/RowActions';

describe('RowActions', () => {
  const onDelete = jest.fn(() => Promise.resolve(true));
  const rowModesModel: GridRowModel = { '1': { mode: 'view' } };
  const row = { id: '1' };
  const rowsActions = ['edit', 'delete'];
  const setRowModesModel = jest.fn();
  const setRows = jest.fn();
  const rows = [row];

  beforeEach(() => {
    onDelete.mockClear();
    setRowModesModel.mockClear();
    setRows.mockClear();
    rowModesModel[row.id] = { mode: 'view' };
  });

  it('matches snapshot', () => {
    const { container } = render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the edit and delete actions', () => {
    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );

    const editButton = screen.getByLabelText('ערוך');
    const deleteButton = screen.getByLabelText('מחק');

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('renders the save and cancel actions when in edit mode', () => {
    rowModesModel[row.id] = { mode: 'edit' };

    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );

    const saveButton = screen.getByLabelText('שמור');
    const cancelButton = screen.getByLabelText('בטל');

    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('calls the onDelete function when delete is clicked', async () => {
    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByLabelText('מחק');
    await userEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(row.id);
  });

  it('calls the setRows function with the updated list of rows when delete is clicked and onDelete returns true', async () => {
    onDelete.mockResolvedValue(true);

    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByLabelText('מחק');
    await userEvent.click(deleteButton);

    expect(setRows).toHaveBeenCalledWith([]);
  });

  it('does not call the setRows function when delete is clicked and onDelete returns false', async () => {
    onDelete.mockResolvedValue(false);

    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByLabelText('מחק');
    await userEvent.click(deleteButton);

    expect(setRows).not.toHaveBeenCalled();
  });

  it('should call setRowModesModel when edit button is clicked', () => {
    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );
    userEvent.click(screen.getByLabelText('ערוך'));
    waitFor(() => expect(setRowModesModel).toHaveBeenCalled());
  });

  it('should call setRowModesModel when cancel button is clicked', () => {
    rowModesModel[row.id] = { mode: 'edit' };

    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );
    userEvent.click(screen.getByLabelText('בטל'));
    waitFor(() => expect(setRowModesModel).toHaveBeenCalled());
  });

  it('should call setRowModesModel when save button is clicked', () => {
    rowModesModel[row.id] = { mode: 'edit' };

    render(
      // @ts-ignore
      <RowActions
        rowModesModel={rowModesModel}
        row={row}
        rowsActions={rowsActions}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        rows={rows}
        onDelete={onDelete}
      />
    );
    userEvent.click(screen.getByLabelText('שמור'));
    waitFor(() => expect(setRowModesModel).toHaveBeenCalled());
  });
});
