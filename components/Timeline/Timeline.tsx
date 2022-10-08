import React, {useEffect, useState} from 'react';
import styles from './Timeline.module.scss';

const Timeline = ({ children, progress } : { children: JSX.Element | JSX.Element[], progress: number }) => {
    return (
        <div>
            <div className={styles.timeline}>
                <div className={styles.timelineProgress} style={{ width: `${progress}%` }}></div>
                <div className={styles.timelineItems}>
                    {children}
                </div>
            </div>
        </div>

    );
};

export default Timeline;
