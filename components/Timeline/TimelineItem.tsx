import React, {MutableRefObject, useEffect, useRef, useState} from 'react';
import styles from './TimelineItem.module.scss';
import {AnimatePresence, motion, useAnimation} from "framer-motion";

type TimelineItemProps = {
    children: JSX.Element[] | JSX.Element | null,
    tooltipText?: string,
    disableAnimation: (key: number) => void,
    animationKey: number,
    animate: boolean,
}

const TimelineItem = ({ children, tooltipText, disableAnimation, animationKey, animate }: TimelineItemProps) => {
    const [active, setActive] = useState<boolean>(false);
    const [animationActive, setAnimationActive] = useState<boolean>(false);
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const timelineOuterRef: MutableRefObject<HTMLDivElement | null> = useRef(null)
    const timelineContentRef: MutableRefObject<HTMLDivElement | null> = useRef(null)
    const controls = useAnimation();

    useEffect(() => {
        if (animate) {
            controls.start('start')
            setAnimationActive(true)
        }
    }, [])

    useEffect(() => {
        if (!animationActive) setShowTooltip(true)
        else setShowTooltip(false)
    }, [animationActive])

    useEffect(() => {
        if (!animate) setAnimationActive(false)
    }, [animate]);

    const handleMouseEnter = () => {
        setActive(true)
        setShowTooltip(false)
        controls.stop()
        disableAnimation(animationKey);
    }

    const handleMouseLeave = () => {
        setActive(false)
        if (animate) {
            controls.start('start')
            setAnimationActive(true)
        }
    }

    const getRandomDelay = () => -(Math.random() * 0.7 + 0.05);

    const randomDuration = () => Math.random() * 0.07 + 0.23;

    const variants = {
        start: {
            x: [-10, 13, 0],
            transition: {
                delay: getRandomDelay(),
                repeat: 5,
                duration: randomDuration(),
            }
        }
    };

    const handleAnimationComplete = () => {
        setAnimationActive(false)
        setTimeout(() => {
            if (animate) controls.start('start')
            setAnimationActive(true)
        }, Math.abs(getRandomDelay()) * 10000)
    }

    return (
        <div
            className={`${styles.timelineItem} ${active ? styles.active : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={timelineOuterRef}
        >
            <AnimatePresence initial={false} mode="wait">
                {!active && (
                    <motion.div key={1} initial={{ opacity: 1 }} exit={{ x: 100, opacity: 0 }} className={styles.timelineItemText}>
                        <motion.div
                            variants={variants}
                            animate={controls}
                            onAnimationComplete={handleAnimationComplete}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                )}
                {active && (
                    <motion.div key={2} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={styles.timelineContent} ref={timelineContentRef}>
                        <p>{tooltipText}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
                {showTooltip && animate && (
                    <motion.div key={3} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className={styles.tooltip}>
                        עברו עליי עם העכבר
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimelineItem;
