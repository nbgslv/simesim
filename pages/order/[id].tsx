import React from 'react';
import {useRouter} from "next/router";
import MainLayout from "../../components/Layouts/MainLayout";

const Checkout = () => {
    const router = useRouter()
    const { id } = router.query

    return (
        <MainLayout>
            <h1>Checkout</h1>
            <p>Order ID: {id}</p>
        </MainLayout>
    );
};

export default Checkout;
