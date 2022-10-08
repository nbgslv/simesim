import type { NextPage } from 'next'
import Header from "../components/Header/Header";
import Timeline from "../components/Timeline/Timeline";
import TimelineItem from "../components/Timeline/TimelineItem";
import styles from "../styles/Home.module.scss";
import React, {LegacyRef, useEffect, useRef, useState} from "react";
import {useScroll, useTransform, motion} from "framer-motion";
import checkoutIcon from "../public/mail-box.png";
import qrCode from "../public/qrCode.png";
import globalConnection from "../public/global-connection.png";
import Image from "next/image";
import Section from "../components/Section/Section";
import text from '../lib/content/text.json'
import {homedir} from "os";
import TimelineSection from "../components/Timeline/TimelineSection";

const Home: NextPage = () => {
    const [timeLineInView, setTimeLineInView] = useState<boolean>(false);
    const timelineRef: LegacyRef<HTMLDivElement> = useRef(null)
    const { scrollYProgress: scrollYProgressTimeLine } = useScroll({
        target: timelineRef,
        offset: ['start center', 'end end']
    })
    const { scrollYProgress } = useScroll()
    const timelineProgressAnimation = useTransform(scrollYProgress, [0.5, 1], [0, 100])

    useEffect(() => {
        scrollYProgressTimeLine.onChange((value) => {
            if (value > 0.99) {
                setTimeLineInView(true)
            } else {
                setTimeLineInView(false)
            }
        })
    }, [scrollYProgressTimeLine, timelineProgressAnimation])

  return (
    <>
        <Header />
        <Section title={text.home.timelineSectionTitle} sticky={timeLineInView} forwardRef={timelineRef} >
            <TimelineSection inView={timeLineInView} />
        </Section>
    </>
  )
}

export default Home
