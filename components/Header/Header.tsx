import React, {useCallback, useEffect} from 'react';
import CustomNavbar from "../Navbar/CustomNavbar";
import {Button, Col, Container, Row} from "react-bootstrap";
import styles from './Header.module.scss'
import Image from "next/image";
import coverImage from '../../public/esimOne.png'
import logoTextWhite from '../../public/logoTextWhite.png'
import text from '../../lib/content/text.json'

const Header = () => {
    const [navbarBackground, setNavbarBackground] = React.useState<string | null>(null)
    const [navbarHeight, setNavbarHeight] = React.useState<string>('7rem')

    const handleScroll = useCallback(() => {
        if (window.scrollY > 10) {
            setNavbarBackground('light')
            setNavbarHeight('2.5rem')
        } else {
            setNavbarBackground(null)
            setNavbarHeight('7rem')
        }
    }, [])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header>
            <div className={`d-flex flex-column ${styles.cover}`}>
                <CustomNavbar background={navbarBackground} height={navbarHeight} />
                <Container className="d-flex mt-auto mb-auto text-center">
                    <Row className="d-flex mr-auto justify-content-between align-items-center">
                        <Col>
                            <Image src={coverImage} />
                        </Col>
                        <Col>
                            <Image src={logoTextWhite} layout="fixed" width={300} height={55} />
                            <p className="mt-4">{text.home.coverText}</p>
                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="primary" className={styles.actionButton}>{text.home.orderButtonText}</Button>
                                <Button variant="outline-primary" className={styles.actionButtonSecondary}>{text.home.moreDetailsButtonText}</Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </header>
    );
};

export default Header;
