import React from 'react';
import { Prisma } from '@prisma/client';
import AdminLayout from "../../components/Layouts/AdminLayout";
import AdminTable from "../../components/AdminTable/AdminTable";
import prisma from "../../lib/prisma";
import { format } from "date-fns";


const Bundles = ({ bundlesList }: { bundlesList: Prisma.BundleSelect[] }) => {
    const columns = [
        {
            field: 'externalId',
            headerName: 'External ID',
        },
        {
            field: 'name',
            headerName: 'Name',
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 350,
        },
        {
            field: 'coverage',
            headerName: 'Coverage',
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 150,
        },
        {
            field: 'updatedAt',
            headerName: 'Updated At',
            width: 150,
        }
    ]
    return (
        <AdminLayout>
            <AdminTable columns={columns as never[]} data={bundlesList as never} />
        </AdminLayout>
    );
};

export async function getServerSideProps() {
    const bundles = await prisma.bundle.findMany({
        orderBy: {
            createdAt: 'desc',
        }
    })
    const serializedBundles = bundles.map((bundle) => ({
        ...bundle,
        createdAt: format(bundle.createdAt, 'dd/MM/yy kk:mm'),
        updatedAt: format(bundle.updatedAt, 'dd/MM/yy kk:mm')
    }))
    return {
        props: {
            bundlesList: serializedBundles
        },
    }
}

export default Bundles;
