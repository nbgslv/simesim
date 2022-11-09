import React from 'react';
import AdminLayout from "../../components/Layouts/AdminLayout";
import AdminTable from "../../components/AdminTable/AdminTable";
import {Prisma} from "@prisma/client";
import {
    GridColumns, GridRowId,
    GridValidRowModel
} from "@mui/x-data-grid";
import prisma from "../../lib/prisma";
import {format} from "date-fns";

type PlansAsAdminTableData = (GridValidRowModel & Prisma.PlanMaxAggregateOutputType)[]

const Plans = ({ plans }: { plans: PlansAsAdminTableData }) => {
    const [plansRows, setPlansRows] = React.useState<PlansAsAdminTableData>(plans);

    const columns: GridColumns = [
        {
            field: 'id',
            headerName: 'ID',
        },
        {
            field: 'line',
            headerName: 'Line',
            editable: true
        },
        {
            field: 'bundle',
            headerName: 'Bundle',
            editable: true
        },
        {
            field: 'refill',
            headerName: 'Refill',
            editable: true
        },
        {
            field: 'price',
            headerName: 'Price',
            editable: true
        },
        {
            field: 'user',
            headerName: 'User',
            editable: true
        },
        {
            field: 'payment',
            headerName: 'Payment',
            editable: true
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
        },
        {
            field: 'updatedAt',
            headerName: 'Updated At',
        }
    ]

    const handleAddRow = async () => {
        const newPlan = await fetch('/api/plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const newPlanJson = await newPlan.json()
        console.log({newPlanJson})
        setPlansRows([...plansRows, newPlanJson])
        return { id: newPlanJson.id, columnToFocus: undefined }
    }

    const handleDeleteRows = async (ids: GridRowId[]) => {
        console.log({ids})
        const deleteCount = await fetch('/api/plans', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        })
        const deleteCountJson = await deleteCount.json()
        console.log({deleteCountJson})
        setPlansRows(plansRows.filter((plan) => !ids.includes(plan.id!)))
    }

    return (
        <AdminLayout>
            <AdminTable
                data={plansRows}
                columns={columns}
                addRow={handleAddRow}
                deleteRows={handleDeleteRows}
            />
        </AdminLayout>
    );
};

export async function getServerSideProps() {
    const plans = await prisma.plan.findMany({
        include: {
            planModel: true,
            user: true,
            payment: true,
            line: true,
        },
        orderBy: {
            updatedAt: 'desc',
        }
    })
    const serializedPlans = plans.map((plan) => ({
        ...plan,
        createdAt: format(plan.createdAt, 'dd/MM/yy kk:mm'),
        updatedAt: format(plan.updatedAt, 'dd/MM/yy kk:mm')
    }))
    return {
        props: {
            plans: serializedPlans
        }
    }
}

export default Plans;
