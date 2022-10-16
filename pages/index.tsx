import Header from "../components/Header/Header";
import React, {useState} from "react";
import Section from "../components/Section/Section";
import text from '../lib/content/text.json'
import TimelineSection from "../components/Timeline/TimelineSection";
import KeepGoApi from "../utils/api/sevices/keepGo/api";
import {Bundle, KeepGoResponse} from "../utils/api/sevices/keepGo/types";
import CountrySearch from "../components/CountrySearch/CountrySearch";
import BundleCard from "../components/Bundles/BundleCard";
import Controller from "../components/ScrollMagic/Controller";
import Scene from "../components/ScrollMagic/Scene";

type HomeProps = {
    countriesList: { [key: string]: string },
    bundlesList: Bundle[]
}

export default function Home({ countriesList, bundlesList }: HomeProps): JSX.Element {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    const handleCountrySelect = (country: string) => {
        setSelectedCountry(country)
    }

    return (
    <Controller>
        <Header />
        <Scene duration={6000}>
            <Section title={text.home.timelineSectionTitle} id="timeline-section">
                <TimelineSection />
            </Section>
        </Scene>
        <Scene duration={4000}>
            <Section title={''} id="bundles-section">
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
        </Scene>
    </Controller>
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
