'use client'
import Box from '@mui/material/Box';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {Race} from '../parsers/raceParser';
import {Suspense, useDeferredValue, useEffect, useState} from 'react';
import SectionBox from './sectionBox';
import {useReinc} from "@/app/contexts/reincContext";
import {CreatorDataType} from "@/app/parserFactory";

const columns: GridColDef<(Race)>[] = [
    {field: 'name', headerName: 'Name'},
    {
        field: 'str',
        headerName: 'str',
        type: 'number',
        sortable: true,
    },
    {
        field: 'dex',
        headerName: 'dex',
        type: 'number',
        sortable: true,
    },
    {
        field: 'con',
        headerName: 'con',
        type: 'number',
        sortable: true,
    },
    {
        field: 'int',
        headerName: 'int',
        type: 'number',
        sortable: true,
    },
    {
        field: 'wis',
        headerName: 'wis',
        type: 'number',
        sortable: true,
    },
    {
        field: 'cha',
        headerName: 'cha',
        type: 'number',
        sortable: true,
    },
    {
        field: 'size',
        headerName: 'size',
        type: 'number',
        sortable: true,
    },
    {
        field: 'exp',
        headerName: 'exp',
        type: 'number',
        sortable: true,
    },
    {
        field: 'spr',
        headerName: 'spr',
        type: 'number',
        sortable: true,
    },
    {
        field: 'hpr',
        headerName: 'hpr',
        type: 'number',
        sortable: true,
    },
    {
        field: 'skill_max',
        headerName: 'skill max',
        type: 'number',
        sortable: true,
    },
    {
        field: 'spell_max',
        headerName: 'spell max',
        type: 'number',
        sortable: true,
    }, {
        field: 'skill_cost',
        headerName: 'skill cost',
        type: 'number',
        sortable: true,
    }, {
        field: 'spell_cost',
        headerName: 'spell cost',
        type: 'number',
        sortable: true,
    },
];

export default function RaceList(props: { myData:CreatorDataType }) {
    const creatorData = props.myData

    return (
        <SectionBox title='Races'>
            <Suspense fallback="Loading...">
                {creatorData?.races? (
                        <DataGrid
                            sx={{height: 400, width: '100%'}}
                            rows={props.myData.races}
                            columns={columns}
                            initialState={{}}
                            checkboxSelection
                            disableRowSelectionOnClick
                            disableMultipleRowSelection
                            hideFooter={true}
                            disableVirtualization
                        />
                ) : <></>
                }
            </Suspense>
        </SectionBox>
    )
}