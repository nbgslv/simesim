import React, {useEffect, useRef, useState} from 'react';
import Timeline from "./Timeline";
import {motion, useScroll, useTransform} from "framer-motion";
import TimelineItem from "./TimelineItem";
import text from "../../lib/content/text.json";
import Image from "next/image";
import styles from './TimelineSection.module.scss'
import checkoutIcon from "../../public/checkout.svg";
import emailIcon from '../../public/mail-box.svg'
import qrCode from "../../public/qrCode.svg";
import globalConnection from "../../public/global-connection.png";
import Section from "../Section/Section";

const TimelineSection = () => {
    const [timelineProgress, setTimelineProgress] = useState<number>(0);
    const [timelineOneBackground, setTimelineOneBackground] = useState<string>('#4502c6');
    const [timelineTwoBackground, setTimelineTwoBackground] = useState<string>('#4502c6');
    const [timelineThreeBackground, setTimelineThreeBackground] = useState<string>('#4502c6');
    const { scrollYProgress } = useScroll()
    const containerRef = useRef<HTMLDivElement>(null)
    const timelineOneAnimation = useTransform(scrollYProgress, [0, 0.06, 0.2], [1, 1, 1.3])
    const timelineOneBgAnimation = useTransform(scrollYProgress, [0, 0.06, 0.2], ['#4502c6', '#4502c6', '#ff3904'])
    const timelineOneTooltipAnimation = useTransform(scrollYProgress, [0, 0.06, 0.2], [0, 0, 1])
    const timelineTwoAnimation = useTransform(scrollYProgress, [0.2, 0.4], [1, 1.3])
    const timelineTwoBgAnimation = useTransform(scrollYProgress, [0.2, 0.4], ['#4502c6', '#ff3904'])
    const timelineTwoTooltipAnimation = useTransform(scrollYProgress, [0.2, 0.4], [0, 1])
    const timelineThreeAnimation = useTransform(scrollYProgress, [0.4, 0.6], [1, 1.3])
    const timelineThreeBgAnimation = useTransform(scrollYProgress, [0.4, 0.6], ['#4502c6', '#ff3904'])
    const timelineThreeTooltipAnimation = useTransform(scrollYProgress, [0.4, 0.6], [0, 1])
    const timelineProgressAnimation = useTransform(scrollYProgress, [0.06, 0.6], [0, 100])

    useEffect(() => {
        timelineProgressAnimation.onChange((value) => {
            setTimelineProgress(value)
        })
        timelineOneBgAnimation.onChange((value) => {
            setTimelineOneBackground(value)
        })
        timelineTwoBgAnimation.onChange((value) => {
            setTimelineTwoBackground(value)
        })
        timelineThreeBgAnimation.onChange((value) => {
            setTimelineThreeBackground(value)
        })
    }, [timelineProgressAnimation])

    return (
        <Section title={text.home.timelineSectionTitle} id="timeline-section" className={styles.timelineSection}>
            <div className={`${styles.timelineWrapper} d-flex flex-column justify-content-center`} ref={containerRef}>
                <Timeline progress={timelineProgress}>
                    <motion.div style={{ scale: timelineOneAnimation }}>
                        <TimelineItem tooltipScale={timelineOneTooltipAnimation} bgColor={timelineOneBackground} tooltipText={text.home.stepOneContentText}>
                            <h2>{text.home.stepOneText}</h2>
                            <div className={styles.iconContainer}><Image src="/checkout.svg" layout="fill" alt="shopping bag" /></div>
                        </TimelineItem>
                    </motion.div>
                    <motion.div style={{ scale: timelineTwoAnimation }}>
                        <TimelineItem tooltipScale={timelineTwoTooltipAnimation} bgColor={timelineTwoBackground} tooltipText={text.home.stepTwoContentText}>
                            <h2>{text.home.stepTwoText}</h2>
                            <div className={styles.iconContainer}><Image src="/mail-box.svg" layout="fill" alt="qr code" /></div>
                        </TimelineItem>
                    </motion.div>
                    <motion.div style={{ scale: timelineThreeAnimation }}>
                        <TimelineItem tooltipScale={timelineThreeTooltipAnimation} bgColor={timelineThreeBackground} tooltipText={text.home.stepThreeContentText}>
                            <h2>{text.home.stepThreeText}</h2>
                            <div className={styles.iconContainer}><Image src="/qrCode.svg" layout="fill" alt="e-sim icon" /></div>
                        </TimelineItem>
                    </motion.div>
                </Timeline>
            </div>
        </Section>
    );
};

export default TimelineSection;
