import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminExpandableCell from '../../../components/AdminExpandableCell/AdminExpandableCell';

describe('AdminExpandableCell', () => {
  const value =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.';
  const shortValue = 'Lorem ipsum dolor';
  const length = 20;

  it('renders the short value by default', () => {
    render(
      <AdminExpandableCell
        value={value}
        shortValue={shortValue}
        length={length}
      />
    );
    expect(screen.getByText(shortValue)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('expands and shows the full value when the button is clicked', () => {
    render(
      <AdminExpandableCell value={value} shortValue={value} length={length} />
    );
    expect(
      screen.getByText(value.substring(0, length)).textContent?.trim()
    ).toHaveLength(length);
    expect(screen.getByText(value.substring(0, length))).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show more...' }));
    expect(screen.getByText(value)).toBeInTheDocument();
  });

  it('shows the "Hide" button when the value is expanded', () => {
    render(
      <AdminExpandableCell value={value} shortValue={value} length={length} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show more...' }));
    expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
  });

  it('hides the full value when the button is clicked again', () => {
    render(
      <AdminExpandableCell value={value} shortValue={value} length={length} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show more...' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(
      screen.getByText(value.substring(0, length)).textContent?.trim()
    ).toHaveLength(length);
  });
});
