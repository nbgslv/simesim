import React from 'react';
import prisma from "../../lib/prisma";
import AdminTable from "../../components/AdminTable/AdminTable";
import styles from '../../styles/main.module.scss'
import AdminLayout from "../../components/Layouts/AdminLayout";

const Main = ({ lastLines }) => {
    return (
        <AdminLayout>
            <div className={styles.main}>
                <AdminTable data={lastLines} limit={10} />
            </div>
        </AdminLayout>
    );
};

export async function getServerSideProps() {
    const lines = await prisma.line.findMany({
        take: 10,
        orderBy: {
            createdAt: 'desc',
        }
    })
    return {
        props: {
            lastLines: lines
        },
    }
}

export default Main;
