import React from 'react';
import { Modal, Button } from "react-bootstrap";
import styles from './ConfirmationModal.module.scss'

type ConfirmationModalProps = {
    show: boolean,
    onHide?: () => void,
    title: string,
    body: string,
    confirmButtonText?: string,
    cancelButtonText?: string,
    confirmAction?: (() => void) | (() => Promise<void>),
    cancelAction?: (() => void) | (() => Promise<void>)
}

const ConfirmationModal = ({
    show,
    onHide,
    title,
    body,
    confirmButtonText,
    cancelButtonText,
    confirmAction,
    cancelAction
}: ConfirmationModalProps) => {
    return (
        <Modal show={show} onHide={cancelAction} className={styles.main}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>{body}</p>
            </Modal.Body>

            <Modal.Footer>
                {cancelButtonText && <Button onClick={cancelAction} variant="secondary">{cancelButtonText}</Button>}
                {confirmButtonText && <Button onClick={confirmAction} variant="primary">{confirmButtonText}</Button>}
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
