import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { openMenu } from 'react-select-event';
import AdminSelect, {
  AdminSelectOption,
} from '../../../components/AdminSelect/AdminSelect';

const onSelect = jest.fn();

const options: AdminSelectOption[] = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

describe('AdminSelect', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <AdminSelect
        ariaLabel="test-label"
        options={options}
        onSelect={onSelect}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders select options', () => {
    const { getByRole, getByText } = render(
      <AdminSelect
        ariaLabel="test-label"
        options={options}
        onSelect={onSelect}
      />
    );
    const input = getByRole('combobox');
    openMenu(input);

    options.forEach((option) => {
      expect(getByText(option.label)).toBeInTheDocument();
    });
  });

  it('calls onSelect when an option is selected', () => {
    const { getByText, getByRole } = render(
      <AdminSelect
        ariaLabel="test-label"
        options={options}
        onSelect={onSelect}
      />
    );
    const input = getByRole('combobox');
    openMenu(input);

    const option = getByText('Option 2');
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith({ label: 'Option 2', value: '2' });
  });

  it('renders selected options when a default value is provided', () => {
    const defaultValue: AdminSelectOption[] = [
      { label: 'Option 1', value: '1' },
    ];
    const { getByText } = render(
      <AdminSelect
        ariaLabel="test-label"
        options={options}
        onSelect={onSelect}
        defaultValue={defaultValue}
      />
    );
    expect(getByText('Option 1')).toBeInTheDocument();
  });

  it('allows to search for a value', () => {
    const { getByRole, getAllByText } = render(
      <AdminSelect
        ariaLabel="test-label"
        options={options}
        onSelect={onSelect}
      />
    );
    const input = getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Option' } });
    const menuOptions = getAllByText(/Option/);
    expect(menuOptions).toHaveLength(3);
    fireEvent.change(input, { target: { value: 'Option 1' } });
    const menuOption = getAllByText(/Option/);
    expect(menuOption).toHaveLength(1);
  });

  it('allows to select multiple values', () => {
    const { getByRole, getAllByText, getByText, getAllByLabelText } = render(
      <AdminSelect
        ariaLabel="test-label"
        options={options}
        onSelect={onSelect}
        name="test-select"
        inputId="test-select"
        isMulti
      />
    );
    const input = getByRole('combobox');
    openMenu(input);

    const option1 = getByText('Option 2');
    fireEvent.click(option1);
    expect(onSelect).toHaveBeenCalledWith([{ label: 'Option 2', value: '2' }]);
    expect(getAllByText('Option 2')).toHaveLength(1);
    expect(getAllByLabelText(/Remove/i)).toHaveLength(1);

    openMenu(input);

    const option2 = getByText('Option 1');
    fireEvent.click(option2);
    expect(onSelect).toHaveBeenCalledWith([
      { label: 'Option 2', value: '2' },
      { label: 'Option 1', value: '1' },
    ]);
    expect(getAllByText(/Option/i)).toHaveLength(2);
    expect(getAllByLabelText(/Remove/i)).toHaveLength(2);
  });

  it('shows default value for single select', () => {
    const { getAllByText, getByText } = render(
      <AdminSelect
        ariaLabel="test-label"
        options={options}
        onSelect={onSelect}
        defaultValue={{ label: 'Option 2', value: '2' }}
        name="test-select"
        inputId="test-select"
      />
    );

    const option1 = getByText('Option 2');
    fireEvent.click(option1);
    expect(getAllByText('Option 2')).toHaveLength(1);
  });

  it('shows default value for multi select', () => {
    const { getByText } = render(
      <form role="form">
        <AdminSelect
          ariaLabel="test-label"
          options={options}
          onSelect={onSelect}
          defaultValue={[
            { label: 'Option 2', value: '2' },
            { label: 'Option 1', value: '1' },
          ]}
          name="test-select"
          inputId="test-select"
          isMulti
        />
      </form>
    );

    expect(getByText('Option 2')).toBeInTheDocument();
    expect(getByText('Option 1')).toBeInTheDocument();
  });
});
