import NiceModal, { useModal } from '@ebay/nice-modal-react';
import ConfirmationModal, { ConfirmationModalProps } from './ConfirmationModal';

export default NiceModal.create(
  ({
    show, // onHide,
    title,
    body,
    confirmButtonText,
    cancelButtonText,
    confirmAction,
    cancelAction,
    id,
    ...props
  }: ConfirmationModalProps) => {
    const modal = useModal();
    return (
      <ConfirmationModal
        show={show}
        title={title}
        body={body}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
        confirmAction={() => {
          modal.resolve(true);
          confirmAction?.();
        }}
        cancelAction={() => {
          modal.reject(false);
          cancelAction?.();
        }}
        id={id}
        {...props}
      />
    );
  }
);
