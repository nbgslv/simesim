import React, {useState} from 'react';
import Section from "../Section/Section";
import CountrySearch, {Country} from "../CountrySearch/CountrySearch";
import {Bundle, Refill} from "../../utils/api/sevices/keepGo/types";
import styles from './BundlesSection.module.scss';
import {Row, Col, Button} from "react-bootstrap";
import * as travelImageData from '../../public/travel.json';
import Lottie from "react-lottie";
import {AnimatePresence, motion} from "framer-motion";
import BundlesScroll from "./BundlesScroll";

const BundlesSection = ({ countriesList, bundlesList }: { countriesList: { [key: string]: string }, bundlesList: Bundle[] }) => {
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
    const [selectedRefill, setSelectedRefill] = useState<Refill | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);

    const handleCountrySelect = (country: Country | null) => {
        setSelectedCountry(country)
        if (country) {
            setCurrentStep(1)
            if (country !== selectedCountry) {
                setSelectedBundle(null)
                setSelectedRefill(null)
            }
        } else {
            setCurrentStep(0)
            setSelectedBundle(null)
            setSelectedRefill(null)
        }
    }

    const handleRefillSelect = (refill: Refill | null, bundleId: number | null) => {
        setSelectedBundle(bundleId);
        setSelectedRefill(refill);
        if (refill && bundleId) {
            setCurrentStep(2)
        } else {
            setCurrentStep(1)
        }
    }

    const handleRefillReset = () => {
        setSelectedBundle(null);
        setSelectedRefill(null);
        setCurrentStep(1)
    }

    return (
        <AnimatePresence>
            <Section id="bundles-section" className={styles.bundlesSection}>
                <Row className={`d-flex justify-content-between align-items-center p-3 ${styles.row}`}>
                    <Col className={`d-flex justify-content-between flex-column ${styles.bundlesSearch}`}>
                        {currentStep >= 0 ? (
                            <div className={styles.firstStepContainer}>
                                <div className={`${styles.infoPlate} p-1 mb-2`}>
                                    <h3>1. מספרים לנו לאן אתם טסים</h3>
                                </div>
                                <div className="h-100">
                                    <CountrySearch countriesList={countriesList} onSelect={handleCountrySelect} />
                                </div>
                            </div>
                        ): null}
                        {currentStep >= 1 ? (
                            <div className="h-100">
                                <div className={`${styles.infoPlate} p-1 mb-2`}>
                                    <h3>2. בוחרים חבילת דאטה</h3>
                                </div>
                                <div className="h-100">
                                    <BundlesScroll bundlesList={bundlesList} setRefill={handleRefillSelect} resetRefill={handleRefillReset} />
                                </div>
                            </div>
                        ): null}
                        <div>
                            <Button variant="primary" size="lg" className={`w-100 ${currentStep < 2 ? 'invisible' : ''}`}>3. מזמינים</Button>
                        </div>
                    </Col>
                    <Col>
                        <Lottie
                            options={{
                                loop: true,
                                autoplay: true,
                                animationData: travelImageData,
                            }}
                        />
                    </Col>
                </Row>
            </Section>
        </AnimatePresence>
    );
};

export default BundlesSection;
