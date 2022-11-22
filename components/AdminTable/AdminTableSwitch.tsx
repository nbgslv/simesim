import React from 'react';
import { Spinner, Form } from 'react-bootstrap';
import { GridRowId, GridRowModel, GridValidRowModel } from '@mui/x-data-grid';

type AdminTableSwitchProps<T extends GridValidRowModel> = {
  checked: boolean;
  onChange: (checked: boolean, rowId: GridRowId, row: GridRowModel<T>) => void;
  rowId: GridRowId;
  row: GridRowModel<T>;
  loading: GridRowId;
};

const AdminTableSwitch = <T extends GridValidRowModel>({
  checked,
  onChange,
  rowId,
  row,
  loading,
}: AdminTableSwitchProps<T>) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked, rowId, row);
  };

  if (loading === rowId)
    return <Spinner className="mx-auto" animation={'border'} />;
  return <Form.Check type="switch" checked={checked} onChange={handleChange} />;
};

export default AdminTableSwitch;
