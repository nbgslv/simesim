import React, { ChangeEvent, useEffect } from 'react';
import { Form } from 'react-bootstrap';

export type AdminSelectOption = {
  id: string;
  label: string;
  value: string;
};

type AdminSelectProps = {
  ariaLabel: string;
  options: AdminSelectOption[];
  onSelect: (option: AdminSelectOption) => void;
  defaultValue?: string;
};

const AdminSelect = ({
  ariaLabel,
  options,
  onSelect,
  defaultValue,
}: AdminSelectProps) => {
  const [selected, setSelected] = React.useState<string>('');

  useEffect(() => {
    if (defaultValue) {
      setSelected(defaultValue);
    }
  }, [defaultValue]);

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find(
      (option: AdminSelectOption) => option.value === e.target.value
    );
    setSelected(selectedOption?.value || '');
    if (selectedOption) onSelect(selectedOption);
  };

  return (
    <Form.Select
      aria-label={ariaLabel}
      value={selected}
      onChange={handleSelect}
    >
      {options.map((option: AdminSelectOption) => (
        <option key={option.id} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

export default AdminSelect;
