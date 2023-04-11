import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastContainer } from 'react-toastify';
import AdminCopy from '../../../components/AdminCopy/AdminCopy';

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

describe('AdminCopy', () => {
  it('renders the copy button', () => {
    render(<AdminCopy value="Text to copy" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('copies the text to clipboard when the copy button is clicked', async () => {
    jest.spyOn(navigator.clipboard, 'writeText');
    render(<AdminCopy value="Text to copy" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Text to copy');
  });

  it('shows a toast to confirm the text was copied to clipboard', async () => {
    // jest.spyOn(navigator.clipboard, 'writeText');
    jest.useFakeTimers();
    render(
      <>
        <AdminCopy value="Text to copy" />
        <ToastContainer />
      </>
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(
      screen.getAllByText(/was copied successfully/).length
    ).toBeGreaterThanOrEqual(1);
  });
});
