import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useMediaQuery } from 'react-responsive';
import Timeline from './Timeline';
import TimelineItem from './TimelineItem';
import text from '../../lib/content/text.json';
import styles from './TimelineSection.module.scss';
import Section from '../Section/Section';

const TimelineSection = () => {
  const [animateArray, setAnimateArray] = React.useState<boolean[]>([
    true,
    true,
    true,
  ]);
  const [animate, setAnimate] = React.useState<boolean>(true);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  useEffect(() => {
    setAnimate(!animateArray.some((item) => !item));
  }, [animateArray]);

  useEffect(() => {
    if (isMobile) {
      setAnimateArray([false, false, false]);
      setAnimate(false);
    }
  }, [isMobile]);

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
