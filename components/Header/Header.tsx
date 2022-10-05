import React from 'react';
import CustomNavbar from "../Navbar/CustomNavbar";
import {Button, Col, Container, Row} from "react-bootstrap";
import styles from './Header.module.scss'
import Image from "next/image";
import coverImage from '../../public/esimOne.png'
import logoTextWhite from '../../public/logoTextWhite.png'

const Header = () => {
    return (
        <header>
            <div className={`d-flex flex-column ${styles.cover}`}>
                <CustomNavbar />
                <Container className="d-flex mt-auto mb-auto text-center">
                    <Row className="d-flex mr-auto justify-content-between align-items-center">
                        <Col>
                            <Image src={coverImage} />
                        </Col>
                        <Col>
                            <Image src={logoTextWhite} layout="fixed" width={300} height={55} />
                            <p className="mt-4">לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית לורם איפסום דולור סיט אמט, נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון בלרק - וענוף קולהע צופעט למרקוח איבן איף, ברומץ כלרשט מיחוצים. קלאצי ושבעגט ליבם סולגק. בראיט ולחת צורק מונחף,</p>
                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="primary" className={styles.actionButton}>להזמנה</Button>
                                <Button variant="outline-primary" className={styles.actionButton}>איך זה עובד</Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </header>
    );
};

export default Header;
