'use client'
import Box from '@mui/material/Box';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {Race} from '../parsers/raceParser';
import {Suspense, useDeferredValue, useEffect, useState} from 'react';
import SectionBox from './sectionBox';
import {useReinc} from "@/app/contexts/reincContext";
import {CreatorDataType} from "@/app/parserFactory";

const columns: GridColDef<(Race)>[] = [
    {field: 'name', headerName: 'Name', width: 120,},
    {
        field: 'str',
        headerName: 'str',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'dex',
        headerName: 'dex',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'con',
        headerName: 'con',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'int',
        headerName: 'int',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'wis',
        headerName: 'wis',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'cha',
        headerName: 'cha',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'size',
        headerName: 'size',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'exp',
        headerName: 'exp',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'spr',
        headerName: 'spr',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'hpr',
        headerName: 'hpr',
        type: 'number',
        width: 60,
        sortable: true,
    },
    {
        field: 'skill_max',
        headerName: 'skill max',
        type: 'number',
        width: 100,
        sortable: true,
    },
    {
        field: 'spell_max',
        headerName: 'spell max',
        type: 'number',
        width: 100,
        sortable: true,
    }, {
        field: 'skill_cost',
        headerName: 'skill cost',
        type: 'number',
        width: 100,
        sortable: true,
    }, {
        field: 'spell_cost',
        headerName: 'spell cost',
        type: 'number',
        width: 100,
        sortable: true,
    },
];

export default function RaceList(props: { myData:CreatorDataType }) {
    const creatorData = props.myData

    return (
        <SectionBox title='Races'>
            <Suspense fallback="Loading...">
                {creatorData?.races? (
                    <Box sx={{height: 400, width: '100%'}}>
                        <DataGrid
                            rows={props.myData.races}
                            columns={columns}
                            initialState={{}}
                            checkboxSelection
                            disableRowSelectionOnClick
                            disableMultipleRowSelection
                            hideFooter={true}
                            disableVirtualization
                        />
                    </Box>) : <></>
                }
            </Suspense>
        </SectionBox>
    )
}