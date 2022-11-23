import { GridRowId } from '@mui/x-data-grid';
import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Bundle, Refill, Prisma } from '@prisma/client';
import styles from './BundleCard.module.scss';

const BundleCard = ({
  bundle,
  setRefill,
}: {
  bundle: Bundle & Prisma.BundleGetPayload<{ select: { refills: true } }>;
  setRefill: (refill: Refill | null, bundleId: GridRowId | null) => void;
}) => {
  const [chosenRefill, setChosenRefill] = React.useState<number>(-1);

  const handleRefillSelect = (index: number) => {
    if (chosenRefill === index) {
      setChosenRefill(-1);
      setRefill(null, null);
    } else {
      setChosenRefill(index);
      setRefill(bundle.refills[index], bundle.id);
    }
  };

  return (
    <Card className={styles.bundleCardMain}>
      <Card.Body>
        <Card.Title className={styles.bundleCardTitle}>
          {bundle.name}
        </Card.Title>
        <Card.Text className={styles.bundleCardText}>
          {bundle.description}
        </Card.Text>
        <ListGroup>
          {bundle.refills.map((refill, index) => (
            <ListGroup.Item
              key={`${bundle.id}-${refill.title}`}
              className={`${styles.bundleCardListItem} ${
                chosenRefill === index ? styles.bundleCardListItemActive : ''
              }`}
              onClick={() => handleRefillSelect(index)}
            >
              {refill.title} - {refill.price_usd + 1.2}$
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default BundleCard;
