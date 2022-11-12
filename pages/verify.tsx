import React, {useEffect} from 'react';
import MainLayout from "../components/Layouts/MainLayout";
import {Alert, Button, Form, Nav, Spinner} from "react-bootstrap";
import {useCookies} from "react-cookie";
import OtpInput from 'react-otp-input';
import {useRouter} from "next/router";
import {motion} from "framer-motion";
import styles from '../styles/verify.module.scss'
import Countdown, {zeroPad} from "react-countdown";
import {getCsrfToken} from "next-auth/react";
import {NextPageContext} from "next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";

const Verify = ({ csrfToken }: { csrfToken: string }) => {
    const TIMER = 60000 // 60 seconds
    const [phoneNumber, setPhoneNumber] = React.useState<string>('')
    const [otp, setOtp] = React.useState<string>('')
    const [showOtp, setShowOtp] = React.useState<boolean>(true)
    const [alertVariant, setAlertVariant] = React.useState<string>('')
    const [alertMessage, setAlertMessage] = React.useState<string>('')
    const [allowResend, setAllowResend] = React.useState<boolean>(false)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [timer, setTimer] = React.useState<number>(Date.now() + TIMER)
    const [resendLoading, setResendLoading] = React.useState<boolean>(false)
    const [ cookies, _, removeCookie ] = useCookies(['phoneNumber'])
    const router = useRouter()



    useEffect(() => {
        const cookiePhoneNumber = cookies.phoneNumber
        setPhoneNumber(cookiePhoneNumber)
        if (cookiePhoneNumber) {
            // removeCookie('phoneNumber')
            setAlertVariant('success')
            setAlertMessage(`קוד האימות נשלח בהצלחה לוואצאפ ${cookiePhoneNumber}`)
            setShowOtp(true)
        } else {
            setAlertVariant('danger')
            setAlertMessage('אירעה שגיאה, נסה שנית')
            setShowOtp(false)
        }
    }, [])

    const handleVerification = async () => {
        if (otp.length === 6 && phoneNumber) {
            setLoading(true)
            console.log(`/api/auth/callback/email?email=${phoneNumber}&token=${otp}&callbackUrl=${encodeURI(process.env.NEXTAUTH_URL || 'http://localhost:3000')}`)
            await router.push(`/api/auth/callback/email?email=${phoneNumber}&token=${otp}&callbackUrl=${encodeURI(process.env.NEXTAUTH_URL || 'http://localhost:3000')}`)
            setLoading(false)
        } else if (!phoneNumber) {
            setAlertVariant('danger')
            setAlertMessage('אירעה שגיאה, נסה שנית')
        }
    }

    const handleReLogin = async (method?: string) => {
        const params = {
            email: phoneNumber,
            method: method || 'whatsapp',
            csrfToken: csrfToken,
            callbackUrl: 'http://localhost:3000/login',
            json: 'true'
        }

        let methodTranslation = 'לוואצאפ'
        if (method === 'sms') {
            methodTranslation = 'באמצעות מסרון לטלפון'
        } else if (method === 'voice') {
            methodTranslation = 'באמצעות שיחה טלפונית לטלפון'
        }

        setResendLoading(true)
        await fetch(`http://localhost:3000/api/auth/signin/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(Object.entries(params)).toString()
        })
        setResendLoading(false)
        setAlertVariant('success')
        setAlertMessage(`קוד האימות נשלח בהצלחה ${methodTranslation} ${phoneNumber}`)
        setTimer(Date.now() + TIMER)
        setAllowResend(false)
    }

    return (
        <MainLayout hideJumbotron>
            <Form className={`${styles.signIn} d-flex flex-column align-items-center justify-content-center`}>
                {alertVariant && <Alert variant={alertVariant}>{alertMessage}</Alert>}
                {showOtp && <>
                <Form.Group className={styles.formGroup}>
                    <Form.Label>קוד האימות</Form.Label>
                    <div dir="ltr">
                        <OtpInput
                            value={otp}
                            onChange={(value: string) => setOtp(value)}
                            numInputs={6}
                            isInputNum
                            shouldAutoFocus
                            containerStyle={styles.otpInputContainer}
                            inputStyle={styles.otpInput}
                        />
                    </div>
                </Form.Group>
                  <motion.div layout>
                    <Button disabled={loading} className={styles.button} variant="primary" onClick={() => handleVerification()}>
                        {loading ? (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                style={{ color: '#ffffff' }}
                            />
                        ) : (
                            'כניסה'
                        )}
                    </Button>
                  </motion.div>
                </>
                }
                <Alert variant="info" className={styles.alert}>
                    {resendLoading ? (
                        <Spinner
                            as="span"
                            animation="border"
                            role="status"
                            aria-hidden="true"
                        />
                    ) : (
                        <>
                            {allowResend ? (
                                <div>
                                    שלחו לי קוד אימות חדש
                                    <Nav className="d-flex flex-column">
                                        <Nav.Link onClick={() => handleReLogin('sms')}><FontAwesomeIcon icon={solid('caret-left')} /> באמצעות מסרון(הודעת SMS)</Nav.Link>
                                        <Nav.Link onClick={() => handleReLogin('whatsapp')}><FontAwesomeIcon icon={solid('caret-left')} /> או באמצעות וואצאפ</Nav.Link>
                                        <Nav.Link onClick={() => handleReLogin('voice')}><FontAwesomeIcon icon={solid('caret-left')} /> או באמצעות שיחה קולית</Nav.Link>
                                    </Nav>
                                </div>
                            ) : (
                                <>
                                    לא קיבלת קוד? ניתן יהיה לנסות שוב בעוד&nbsp;
                                    <Countdown
                                        date={timer}
                                        autoStart
                                        renderer={({ minutes, seconds }) =>
                                            `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`}
                                        onComplete={() => setAllowResend(true)}
                                    />
                                </>
                            )}
                        </>
                    )}
                </Alert>
            </Form>
        </MainLayout>
    );
};

export async function getServerSideProps(context: NextPageContext) {
    const csrfToken = await getCsrfToken(context)
    return {
        props: { csrfToken },
    }
}

export default Verify;
