import React from 'react';
import {Switch} from "@mui/material";
import {GridApiCommunity} from "@mui/x-data-grid/internals";
import {Spinner} from "react-bootstrap";

type AdminTableSwitchProps<T> = {
    checked: boolean;
    onChange: (
        checked: boolean,
        rowId: string,
        row: T,
        api: GridApiCommunity
    ) => void;
    rowId: string;
    row: T,
    api: GridApiCommunity,
    loading: string
}

const AdminTableSwitch = <T extends object>({ checked, onChange, rowId, row, api, loading }: AdminTableSwitchProps<T>) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked, rowId, row, api);
    }

    if (loading === rowId) return <Spinner className="mx-auto" animation={'border'} />
    return (
        <Switch checked={checked} onChange={handleChange} />
    );
};

export default AdminTableSwitch;
