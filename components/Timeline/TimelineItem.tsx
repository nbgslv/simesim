import React, {MutableRefObject, useEffect, useRef, useState} from 'react';
import styles from './TimelineItem.module.scss';
import {MotionValue, motion} from "framer-motion";

const TimelineItem = ({ children, tooltipText, bgColor, tooltipScale }: { children: JSX.Element[] | JSX.Element | null, tooltipText?: string, bgColor: string, tooltipScale: MotionValue<number> }) => {
    const [active, setActive] = useState<boolean>(false);
    const timelineOuterRef: MutableRefObject<HTMLDivElement | null> = useRef(null)
    const timelineContentRef: MutableRefObject<HTMLDivElement | null> = useRef(null)

    useEffect(() => {
        if (timelineOuterRef.current && timelineContentRef.current) {
            timelineOuterRef.current.style.setProperty('--timeline-bg-color', bgColor)
            timelineContentRef.current.style.setProperty('--timeline-bg-color', bgColor)
        }
    }, [bgColor])

    return (
        <div
            className={`${styles.timelineItemOuter} ${active ? styles.active : ''}`}
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            ref={timelineOuterRef}
        >
            <div className={styles.timelineItemInner}>
                <div className={styles.timelineItemText}>{children}</div>
                <div className={styles.timelineContent} ref={timelineContentRef}>
                    <p>{tooltipText}</p>
                </div>
            </div>
        </div>
    );
};

export default TimelineItem;
