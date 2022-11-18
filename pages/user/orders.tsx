import React from 'react';
import prisma from "../../lib/prisma";
import {unstable_getServerSession} from "next-auth";
import {NextApiRequest, NextApiResponse, NextPageContext} from "next";
import {authOptions} from "../api/auth/[...nextauth]";
import {Prisma} from "@prisma/client";
import MainLayout from "../../components/Layouts/MainLayout";
import {Container} from "react-bootstrap";
import {DataGrid} from "@mui/x-data-grid";

const Orders = ({ orders }: { orders: Prisma.PlanMaxAggregateOutputType[] }) => {

    const columns = [
        {
            field: 'planModel.name',
            headerName: 'שם החבילה',
        },
        {
            field: 'line.status',
            headerName: 'סטטוס',
        },
        {
            field: 'line.allowedUsageKb',
            headerName: 'נפח החבילה',
        },
        {
            field: 'line.remainingUsageKb',
            headerName: 'נפח שנותר',
        },
        {
            field: 'line.remainingDays',
            headerName: 'מספר ימים שנותרו',
        },
        {
            field: 'price',
            headerName: 'מחיר',
            width: 130
        },
        {
            field: 'payment',
            headerName: 'תשלום',
            width: 130
        }
    ];

    return (
        <MainLayout hideJumbotron>
            <div>
                <Container>
                    <h1>Orders</h1>
                    <DataGrid columns={columns} rows={orders} />
                </Container>
            </div>
        </MainLayout>
    );
};

export async function getServerSideProps(context: NextPageContext) {
    const session = await unstable_getServerSession(
        context.req as NextApiRequest,
        context.res as NextApiResponse,
        authOptions(
            context.req as NextApiRequest,
            context.res as NextApiResponse
        )
    );
    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    } else if (session && session.user) {
        const orders = await prisma.plan.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                planModel: true,
                payment: true,
                line: true,

            }
        })
        return {
            props: {
                orders
            },
        }
    }
}

export default Orders;
