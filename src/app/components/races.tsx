'use client'
import Box from '@mui/material/Box';
import {DataGrid, GridCallbackDetails, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import {Race} from '../parsers/raceParser';
import React, {Suspense, useDeferredValue, useEffect, useState} from 'react';
import SectionBox from './sectionBox';
import {useReinc} from "@/app/contexts/reincContext";
import {CreatorDataType} from "@/app/parserFactory";

const defaultCellProps: Partial<GridColDef<(Race)>> = {
    width: 75,
}
const columns: GridColDef<(Race)>[] = [
    {
        field: 'name',
        headerName: 'Name'
    },
    {
        ...defaultCellProps,
        field: 'str',
        headerName: 'str',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'dex',
        headerName: 'dex',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'con',
        headerName: 'con',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'int',
        headerName: 'int',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'wis',
        headerName: 'wis',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'cha',
        headerName: 'cha',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'size',
        headerName: 'size',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'exp',
        headerName: 'exp',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'spr',
        headerName: 'spr',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'hpr',
        headerName: 'hpr',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'skill_max',
        headerName: 'skmax',
        type: 'number',
        sortable: true,
    },
    {
        ...defaultCellProps,
        field: 'spell_max',
        headerName: 'spmax',
        type: 'number',
        sortable: true,
    }, {
        ...defaultCellProps,
        field: 'skill_cost',
        headerName: 'skcost',
        type: 'number',
        sortable: true,
    }, {
        ...defaultCellProps,
        field: 'spell_cost',
        headerName: 'spcost',
        type: 'number',
        sortable: true,
    },
];

export default function RaceList(props: { myData: CreatorDataType }) {
    const creatorData = props.myData
    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>();
    const reinc = useReinc()
    const changeSelectionMode = (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails<any>) => {
        const race: Race | null = details.api.getRow(rowSelectionModel[0]) || null
        reinc.setRace(race)
        console.log("SETTING RACE", race)
        setSelectionModel(rowSelectionModel)
    }
    return (
        <SectionBox title='Races'>
            <Suspense fallback="Loading...">
                {creatorData?.races ? (
                    <DataGrid
                        sx={{height: 400, width: '100%'}}
                        rows={props.myData.races}
                        columns={columns}
                        initialState={{}}
                        checkboxSelection
                        disableRowSelectionOnClick
                        disableMultipleRowSelection
                        rowSelectionModel={selectionModel}
                        onRowSelectionModelChange={changeSelectionMode}
                        hideFooter={true}
                        disableVirtualization
                        columnHeaderHeight={80}
                    />
                ) : <></>
                }
            </Suspense>
        </SectionBox>
    )
}