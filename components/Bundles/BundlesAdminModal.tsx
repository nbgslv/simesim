import { Bundle } from '@prisma/client';
import React from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import CountriesAdminModal from '../Countries/CountriesAdminModal';
import styles from './BundleAdminModal.module.scss';

const BundlesAdminModal = ({
  bundle,
  show,
  onHide,
}: {
  bundle: Bundle;
  show: boolean;
  onHide: () => void;
}) => {
  const [showCountriesModal, setShowCountriesModal] = React.useState<boolean>(
    false
  );
  if (!bundle) return null;
  return (
    <>
      <Modal
        className={styles.main}
        show={show}
        onHide={onHide}
        scrollable
        dir="ltr"
      >
        <Modal.Header closeButton>
          <Modal.Title>Plan&apos;s Model Bundle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>External ID</Col>
            <Col>{bundle.externalId}</Col>
          </Row>
          <Row>
            <Col>Name</Col>
            <Col>{bundle.name}</Col>
          </Row>
          <Row>
            <Col>Description</Col>
            <Col>{bundle.description}</Col>
          </Row>
          <Row>
            <Col>Coverage</Col>
            <Col>
              <Button
                onClick={() => setShowCountriesModal(true)}
                className={styles.coverageButton}
                size="sm"
              >
                Show Coverage
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button className={styles.goToButton}>Go To Bundle</Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      <CountriesAdminModal
        onHide={() => setShowCountriesModal(false)}
        countries={bundle.coverage}
        show={showCountriesModal}
      />
    </>
  );
};

export default BundlesAdminModal;
