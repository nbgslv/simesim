import Header from "../components/Header/Header";
import React, {LegacyRef, useEffect, useRef, useState} from "react";
import {useScroll} from "framer-motion";
import Section from "../components/Section/Section";
import text from '../lib/content/text.json'
import TimelineSection from "../components/Timeline/TimelineSection";
import KeepGoApi from "../utils/api/sevices/keepGo/api";
import {Bundle, KeepGoResponse} from "../utils/api/sevices/keepGo/types";
import CountrySearch from "../components/CountrySearch/CountrySearch";
import BundleCard from "../components/Bundles/BundleCard";

export default function Home({ countriesList, bundlesList }: { countriesList: { [key: string]: string }, bundlesList: Bundle[] }): JSX.Element {
    const [timeLineInView, setTimeLineInView] = useState<boolean>(false);
    const [orderWindowInView, setOrderWindowInView] = useState<boolean>(false);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const timelineRef: LegacyRef<HTMLDivElement> = useRef(null)
    const { scrollYProgress: scrollYProgressTimeLine } = useScroll({
        target: timelineRef,
        offset: ['start center', 'end end']
    })
    const orderWindowRef: LegacyRef<HTMLDivElement> = useRef(null)
    const { scrollYProgress: scrollYProgressOrderWindow } = useScroll({
        target: orderWindowRef,
        offset: ['start center', 'end end']
    })

    useEffect(() => {
        scrollYProgressTimeLine.onChange((value) => {
            if (value > 0.99) {
                setTimeLineInView(true)
            } else {
                setTimeLineInView(false)
            }
        })
    }, [scrollYProgressTimeLine])

    useEffect(() => {
        scrollYProgressOrderWindow.onChange((value) => {
            if (value > 0.99) {
                setTimeLineInView(false)
                setOrderWindowInView(true)
            } else {
                setOrderWindowInView(false)
            }
        })
    }, [scrollYProgressTimeLine])

    const handleCountrySelect = (country: string) => {
        setSelectedCountry(country)
    }


    return (
    <>
        <Header />
        <Section title={text.home.timelineSectionTitle} sticky={timeLineInView} forwardRef={timelineRef} >
            <TimelineSection />
        </Section>
        <Section title={''} sticky={orderWindowInView} forwardRef={orderWindowRef}>
            <CountrySearch countriesList={countriesList} onSelect={handleCountrySelect} />
            <div className="d-flex flex-row justify-content-between">
                {
                    selectedCountry ? bundlesList.filter((bundle) => bundle.coverage.includes(selectedCountry)).map((bundle) => {
                        return (
                            <BundleCard key={bundle.id} title={''} description={''} bundle={bundle} />
                        )
                    }) : null
                }
            </div>
        </Section>
    </>
  )
}

export async function getStaticProps() {
    const keepGoApi = new KeepGoApi(process.env.KEEPGO_BASE_URL, process.env.KEEPGO_API_KEY, process.env.KEEPGO_ACCESS_TOKEN);
    const countriesList: KeepGoResponse | Error = await keepGoApi.getCountries();
    const bundlesList: KeepGoResponse | Error = await keepGoApi.getBundles();

    if (countriesList instanceof Error || bundlesList instanceof Error) {
        return {
            props: {
                countriesList: [],
                bundlesList: []
            }
        }
    }

    return {
        props: {
            countriesList: countriesList.countries,
            bundlesList: bundlesList.bundles
        }
    }
}
