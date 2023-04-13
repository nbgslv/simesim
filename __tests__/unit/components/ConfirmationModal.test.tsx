import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ConfirmationModal from '../../../components/AdminTable/ConfirmationModal';

describe('ConfirmationModal', () => {
  const props = {
    show: true,
    title: 'Test Title',
    body: 'Test Body',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    confirmAction: jest.fn(),
    cancelAction: jest.fn(),
    id: 'test-id',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<ConfirmationModal {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('should render the modal with the correct title and body', () => {
    const { getByText } = render(<ConfirmationModal {...props} />);

    expect(getByText(props.title)).toBeInTheDocument();
    expect(getByText(props.body)).toBeInTheDocument();
  });

  it('should call the cancelAction function when the cancel button is clicked', () => {
    const { getByText } = render(<ConfirmationModal {...props} />);

    fireEvent.click(getByText(props.cancelButtonText));

    expect(props.cancelAction).toHaveBeenCalledTimes(1);
  });

  it('should call the confirmAction function when the confirm button is clicked', async () => {
    const { getByText } = render(<ConfirmationModal {...props} />);

    fireEvent.click(getByText(props.confirmButtonText));

    expect(props.confirmAction).toHaveBeenCalledTimes(1);
  });

  it('should not show the cancel button if the cancelButtonText prop is not provided', () => {
    const { queryByText } = render(
      <ConfirmationModal {...props} cancelButtonText={undefined} />
    );

    expect(queryByText(props.cancelButtonText)).not.toBeInTheDocument();
  });

  it('should not show the confirm button if the confirmButtonText prop is not provided', () => {
    const { queryByText } = render(
      <ConfirmationModal {...props} confirmButtonText={undefined} />
    );

    expect(queryByText(props.confirmButtonText)).not.toBeInTheDocument();
  });
});
