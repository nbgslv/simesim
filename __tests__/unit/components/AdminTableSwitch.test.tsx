import { fireEvent, render, screen } from '@testing-library/react';
import AdminTableSwitch from '../../../components/AdminTable/AdminTableSwitch';

const handeOnChange = jest.fn();

describe('AdminTableSwitch', () => {
  it('renders the switch', () => {
    const { container } = render(
      <AdminTableSwitch
        checked={false}
        onChange={handeOnChange}
        rowId={'1'}
        row={{ id: 1, name: 'John Smith', age: 35 }}
        loading={''}
      />
    );
    expect(
      container.querySelector('input[type="checkbox"]')
    ).toBeInTheDocument();
  });
  it('renders the spinner when loading', () => {
    const { container } = render(
      <AdminTableSwitch
        checked={false}
        onChange={handeOnChange}
        rowId={'1'}
        row={{ id: 1, name: 'John Smith', age: 35 }}
        loading={'1'}
      />
    );

    expect(container.querySelector('.spinner-border')).toBeInTheDocument();
  });
  it('calls onChange when the switch is clicked', () => {
    render(
      <AdminTableSwitch
        checked={false}
        onChange={handeOnChange}
        rowId={'1'}
        row={{ id: 1, name: 'John Smith', age: 35 }}
        loading={''}
      />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handeOnChange).toHaveBeenCalled();
  });
});
