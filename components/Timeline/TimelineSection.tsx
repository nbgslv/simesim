import React, { useEffect } from 'react';
import Timeline from './Timeline';
import TimelineItem from './TimelineItem';
import text from '../../lib/content/text.json';
import styles from './TimelineSection.module.scss';
import Section from '../Section/Section';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';

const TimelineSection = () => {
  const [animateArray, setAnimateArray] = React.useState<boolean[]>([
    true,
    true,
    true,
  ]);
  const [animate, setAnimate] = React.useState<boolean>(true);

  useEffect(() => {
    setAnimate(!animateArray.some((item) => !item));
  }, [animateArray]);

  const handleDisableAnimation = (key: number) => {
    const newAnimateArray = [...animateArray];
    newAnimateArray[key] = false;
    setAnimateArray(newAnimateArray);
  };

  return (
    <Section
      title={text.home.timelineSectionTitle}
      id="timeline-section"
      className={styles.timelineSection}
    >
      <Nav.Link href="/guide">מדריך</Nav.Link>
      <Timeline>
        <TimelineItem
          tooltipText={text.home.stepOneContentText}
          animationKey={0}
          disableAnimation={handleDisableAnimation}
          animate={animate}
        >
          <h2>{text.home.stepOneText}</h2>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon icon={solid('credit-card')} />
          </div>
        </TimelineItem>
        <TimelineItem
          tooltipText={text.home.stepTwoContentText}
          animationKey={1}
          disableAnimation={handleDisableAnimation}
          animate={animate}
        >
          <h2>{text.home.stepTwoText}</h2>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon icon={solid('envelope')} />
          </div>
        </TimelineItem>
        <TimelineItem
          tooltipText={text.home.stepThreeContentText}
          animationKey={2}
          disableAnimation={handleDisableAnimation}
          animate={animate}
        >
          <h2>{text.home.stepThreeText}</h2>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon icon={solid('qrcode')} />
          </div>
        </TimelineItem>
      </Timeline>
    </Section>
  );
};

export default TimelineSection;
