import React, {useEffect} from 'react';
import MainLayout from "../components/Layouts/MainLayout";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import styles from '../styles/login.module.scss'
import {getCsrfToken, signIn, useSession} from "next-auth/react"
import {NextPageContext} from "next";
import { motion } from "framer-motion";
import {useRouter} from "next/router";
import {useCookies} from "react-cookie";

const Login = ({ csrfToken }: { csrfToken: string | undefined }) => {
    const [phoneNumber, setPhoneNumber] = React.useState<string>('')
    const [pageLoading, setPageLoading] = React.useState<boolean>(true)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [callbackUrl, setCallbackUrl] = React.useState<string>('')
    const [alertVariant, setAlertVariant] = React.useState<string>('')
    const [alertMessage, setAlertMessage] = React.useState<string>('')
    const [ _, setCookie ] = useCookies(['phoneNumber', 'simesim_callbackUrl'])
    const { status } = useSession()
    const router = useRouter()

    const handleLogin = async () => {
        console.log({ callbackUrl })
        if (phoneNumber.length === 10) {
            setLoading(true)
            setCookie('phoneNumber', phoneNumber)
            setCookie('simesim_callbackUrl', callbackUrl || 'http://localhost:3000')
            await signIn('email', {email: phoneNumber, callbackUrl: callbackUrl || 'http://localhost:3000'})
            setLoading(false)
        }
    }

    useEffect(() => {
        if (router.query.error) {
            if (router.query.error === 'EmailCreateAccount') {
                setAlertVariant('danger')
                setAlertMessage('אירעה שגיאה, נסה שנית')
            } else if (router.query.error === 'EmailSignin') {
                setAlertVariant('danger')
                setAlertMessage('אירעה שגיאה, נסה שנית')
            } else if (router.query.error === 'SessionRequired') {
                setAlertVariant('danger')
                setAlertMessage('כדי לצפות בתוכן זה עלייך להתחבר תחילה')
            } else if (router.query.error === 'Default') {
                setAlertVariant('danger')
                setAlertMessage('אירעה שגיאה, נסה שנית')
            }
        } else if (router.query.orderId && router.query.phone) {
            setCallbackUrl(`http://localhost:3000/order/${router.query.orderId}`)
            setPhoneNumber(router.query.phone as string)
        }
    }, [])

    useEffect(() => {
        if (router.query.orderId && router.query.phone && phoneNumber !== '' && callbackUrl !== '') {
            handleLogin()
        } else {
            setPageLoading(false)
        }
    }, [phoneNumber, callbackUrl])

    if (status === 'loading' || pageLoading) return (
        <Spinner animation="border" role="status" />
    )

    if (status === 'authenticated') {
        router.push('/')
    }

    if (status === 'unauthenticated') return (
        <MainLayout hideJumbotron>
            <Form className={`${styles.signIn} d-flex flex-column align-items-center justify-content-center`}>
                {alertVariant && <Alert variant={alertVariant}>{alertMessage}</Alert>}
                <Form.Control type="hidden" name="csrfToken" value={csrfToken} />
                <Form.Group className={styles.formGroup}>
                    <Form.Label>טלפון נייד</Form.Label>
                    <Form.Control dir="ltr" onChange={(e) => setPhoneNumber(e.target.value)} className={styles.buttonColor} type="text" name="email" id="email" size="lg" />
                </Form.Group>
                <motion.div layout>
                    <Button disabled={loading} className={styles.button} variant="primary" onClick={() => handleLogin()}>
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

export default Login;
