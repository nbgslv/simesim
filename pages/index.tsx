import Header from "../components/Header/Header";
import React from "react";
import TimelineSection from "../components/Timeline/TimelineSection";
import KeepGoApi from "../utils/api/sevices/keepGo/api";
import {Bundle, KeepGoResponse} from "../utils/api/sevices/keepGo/types";
import Controller from "../components/ScrollMagic/Controller";
import Scene from "../components/ScrollMagic/Scene";
import BundlesSection from "../components/Bundles/BundlesSection";
import QnaSection from "../components/QnA/QnaSection";
import Footer from "../components/Footer/Footer";
import CheckPhoneSection, {PhonesList} from "../components/CheckPhone/CheckPhoneSection";

type HomeProps = {
    countriesList: { [key: string]: string },
    bundlesList: Bundle[],
    phonesList: PhonesList[]
}

export default function Home({ countriesList, bundlesList, phonesList }: HomeProps): JSX.Element {
    return (
    <Controller>
        <Header />
        <Scene duration={500}>
            <TimelineSection />
        </Scene>
        <Scene duration={500}>
            <BundlesSection countriesList={countriesList} bundlesList={bundlesList} />
        </Scene>
        <Scene duration={500}>
            <QnaSection />
        </Scene>
        <Scene duration={500}>
            <CheckPhoneSection phonesList={phonesList} />
        </Scene>
        <Scene duration={0} pin={false}>
            <Footer />
        </Scene>
    </Controller>
  )
}

export async function getStaticProps() {
    const keepGoApi = new KeepGoApi(process.env.KEEPGO_BASE_URL || '', process.env.KEEPGO_API_KEY || '', process.env.KEEPGO_ACCESS_TOKEN || '');
    const countriesList: KeepGoResponse | Error = await keepGoApi.getCountries();
    const bundlesList: KeepGoResponse | Error = await keepGoApi.getBundles();
    const phonesList: KeepGoResponse | Error = await keepGoApi.getEsimDevices();

    if (countriesList instanceof Error || bundlesList instanceof Error || phonesList instanceof Error) {
        return {
            props: {
                countriesList: [],
                bundlesList: [],
                phonesList: []
            }
        }
    }

    return {
        props: {
            countriesList: countriesList.countries,
            bundlesList: bundlesList.bundles,
            phonesList: phonesList.data
        }
    }
}
