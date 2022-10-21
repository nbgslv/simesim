import Header from "../components/Header/Header";
import React, {useState} from "react";
import TimelineSection from "../components/Timeline/TimelineSection";
import KeepGoApi from "../utils/api/sevices/keepGo/api";
import {Bundle, KeepGoResponse} from "../utils/api/sevices/keepGo/types";
import Controller from "../components/ScrollMagic/Controller";
import Scene from "../components/ScrollMagic/Scene";
import BundlesSection from "../components/Bundles/BundlesSection";
import QnaSection from "../components/QnA/QnaSection";
import ScrollController from "../components/ScrollController/ScrollController";

type HomeProps = {
    countriesList: { [key: string]: string },
    bundlesList: Bundle[]
}

export default function Home({ countriesList, bundlesList }: HomeProps): JSX.Element {
    return (

            <Controller>
                <Header />
                <ScrollController>
                    <Scene
                        id="timeline-section"
                        duration={4000}
                        scrollSettings={{
                            enable: false
                        }}
                    >
                        <TimelineSection />
                    </Scene>
                    <Scene id="bundles-section" duration={0} pin={false}>
                        <BundlesSection countriesList={countriesList} bundlesList={bundlesList} />
                    </Scene>
                    <Scene id="qna-section" duration={0} pin={false}>
                        <QnaSection />
                    </Scene>
                </ScrollController>
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
