import React, {RefObject, useCallback} from 'react';
import AdminLayout from "../../components/Layouts/AdminLayout";
import AdminTable from "../../components/AdminTable/AdminTable";
import prisma from "../../lib/prisma";
import {format, parseISO} from "date-fns";
import {Prisma} from "@prisma/client";
import AdminTableSwitch from "../../components/AdminTable/AdminTableSwitch";
import {GridApiCommunity} from "@mui/x-data-grid/internals";
import {GridColumns, GridRowId, GridValidRowModel} from "@mui/x-data-grid";

type CountriesAsAdminTableData = (GridValidRowModel & Prisma.CountrySelect)[]



const Countries = ({ countries }: { countries: CountriesAsAdminTableData }) => {
    const [changeShowLoading, setChangeShowLoading] = React.useState<string>('');
    const [changeLockTranslationLoading, setChangeLockTranslationLoading] = React.useState<string>('');

    const columns: GridColumns = [
        {
            field: 'name',
            headerName: 'Country',
        },
        {
            field: 'translation',
            headerName: 'Translation',
            editable: true,
        },
        {
            field: 'lockTranslation',
            headerName: 'Lock Translation',
            renderCell: (params: any) => {
                return (
                    <AdminTableSwitch
                        checked={params.value}
                        onChange={handleAdminTableLockTranslationSwitchChange}
                        rowId={params.id}
                        row={params.row}
                        api={params.api}
                        loading={changeLockTranslationLoading}
                    />
                )
            }
        },
        {
            field: 'show',
            headerName: 'Show',
            renderCell: (params: any) => {
                return (
                    <AdminTableSwitch
                        checked={params.value}
                        onChange={handleAdminTableShowSwitchChange}
                        rowId={params.id}
                        row={params.row}
                        api={params.api}
                        loading={changeShowLoading}
                    />
                )
            }
        },
        {
            field: 'updatedAt',
            headerName: 'Updated At',
            width: 150,
        }
    ]

    const updateRow = useCallback(async (data: BodyInit) => {
        return fetch('/api/country', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });
    }, [changeShowLoading, changeLockTranslationLoading])

    const handleAdminTableLockTranslationSwitchChange = async (
        checked: boolean,
        rowId: string,
        row: Prisma.CountrySelect,
        api: GridApiCommunity
    ) => {
        try {
            setChangeLockTranslationLoading(rowId)
            const update = await updateRow(JSON.stringify({
                ...row,
                lockTranslation: checked,
                id: row.id,
            }));
            const updateJson = await update.json()
            const serializedUpdate = {...updateJson}
            serializedUpdate.createdAt = format(parseISO(serializedUpdate.createdAt), 'dd/MM/yy kk:mm')
            serializedUpdate.updatedAt = format(parseISO(serializedUpdate.updatedAt), 'dd/MM/yy kk:mm')
            api.updateRows([{...row, lockTranslation: updateJson.lockTranslation}])
        } catch (e) {
            console.error(e)
        } finally {
            setChangeLockTranslationLoading('')
        }
    }


    const handleAdminTableShowSwitchChange = async (
        checked: boolean,
        rowId: string,
        row: Prisma.CountrySelect,
        api: GridApiCommunity
    ) => {
        try {
            setChangeShowLoading(rowId)
            const update = await updateRow(JSON.stringify({
                ...row,
                show: checked,
                id: row.id,
            }));
            const updateJson = await update.json()
            const serializedUpdate = {...updateJson}
            serializedUpdate.createdAt = format(parseISO(serializedUpdate.createdAt), 'dd/MM/yy kk:mm')
            serializedUpdate.updatedAt = format(parseISO(serializedUpdate.updatedAt), 'dd/MM/yy kk:mm')
            api.updateRows([{...row, show: updateJson.show}])
        } catch (e) {
            console.error(e)
        } finally {
            setChangeShowLoading('')
        }
    }

    const handleRowUpdate = async (newRow: Prisma.CountrySelect, oldRow: Prisma.CountrySelect) => {
        try {
            const update = await updateRow(JSON.stringify({
                    ...newRow,
                    id: oldRow.id,
                })
            )
            const updateJson = await update.json()
            const serializedUpdate = {...updateJson}
            serializedUpdate.createdAt = format(parseISO(serializedUpdate.createdAt), 'dd/MM/yy kk:mm')
            serializedUpdate.updatedAt = format(parseISO(serializedUpdate.updatedAt), 'dd/MM/yy kk:mm')
            return serializedUpdate
        } catch (e) {
            console.error(e)
            return oldRow
        }
    }

    const handleRowsDelete = async (rows: Map<GridRowId, GridValidRowModel>, apiRef: RefObject<GridApiCommunity>) => {
        try {
            console.log({ rows })
            const deleteRes = await fetch('/api/country', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: Array.from(rows.keys())
                })
            })
            const deleteJson = await deleteRes.json()
            return deleteJson.count
        } catch (e) {
            console.error(e)
            return 0
        }
    }

    return (
        <AdminLayout>
            <AdminTable
                columns={columns}
                data={countries}
                processRowUpdate={handleRowUpdate}
                onDelete={handleRowsDelete}
            />
        </AdminLayout>
    );
};

export async function getServerSideProps() {
    const countries = await prisma.country.findMany({
        orderBy: {
            updatedAt: 'desc',
        }
    })
    const serializedCountries = countries.map((country) => ({
        ...country,
        createdAt: format(country.createdAt, 'dd/MM/yy kk:mm'),
        updatedAt: format(country.updatedAt, 'dd/MM/yy kk:mm')
    }))
    return {
        props: {
            countries: serializedCountries
        }
    }
}

export default Countries;
