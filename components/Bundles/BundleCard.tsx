import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { PlanModel } from '@prisma/client';
import { motion, useAnimationControls } from 'framer-motion';
import styles from './BundleCard.module.scss';

const BundleCard = ({
  bundle,
  setBundle,
}: {
  bundle: PlanModel | undefined;
  setBundle: (planModelId: string | null) => void;
}) => {
  const [chosenPlanModel, setChosenPlanModel] = React.useState<string>('');
  const controls = useAnimationControls();

  const variants = {
    start: {
      scale: [1, 1.1, 1],
      transition: {
        type: 'spring',
        duration: 3,
        repeat: Infinity,
      },
    },
  };

  useEffect(() => {
    if (bundle) {
      controls.start('start');
    }
  }, []);

  const handlePlanModelSelect = (id: string) => {
    if (chosenPlanModel === id) {
      setChosenPlanModel('');
      setBundle(null);
      controls.start('start');
    } else {
      setChosenPlanModel(id);
      setBundle(id);
      controls.stop();
    }
  };

  if (!bundle) return null;

  return (
    <motion.div
      whileHover={{
        scale: 1.1,
        boxShadow: '0px 3px 15px 5px rgba(0,0,0,0.25)',
      }}
      className={styles.bundleCardContainer}
    >
      <motion.div animate={controls} variants={variants}>
        <Card
          className={styles.bundleCardMain}
          onClick={() => handlePlanModelSelect(bundle.id)}
        >
          <Card.Body className={styles.cardBody}>
            <Card.Title className={styles.bundleCardTitle}>
              {bundle.name}
            </Card.Title>
            <Card.Text className={styles.bundleCardText}>
              {bundle.description}
            </Card.Text>
            <Card.Text className={styles.bundleCardText}>
              {bundle.price}
              {'\u20AA'}
            </Card.Text>
          </Card.Body>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BundleCard;
