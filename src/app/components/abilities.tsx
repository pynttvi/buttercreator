'use client'
import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {DataGrid, GridColDef, GridRowEditStopParams, MuiEvent} from '@mui/x-data-grid';
import {Suspense, useDeferredValue, useEffect, useState} from 'react';
import {ReincType, useReinc} from '../contexts/reincContext';
import {Ability} from '../parsers/abilityCostParser';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";


const round5 = (n: number) => {
    return Math.ceil(n / 5) * 5;
}

export default function AbilityList(props: { type: "skills" | "spells", creatorData: CreatorDataType }) {
    const reinc: ReincType = useReinc()
    const abilities = props.type === 'skills' ? props.creatorData.skills : props.creatorData.spells
    const columns: GridColDef<(Ability)>[] = [
        {field: 'name', headerName: 'Name', width: 300, filterable: true},
        {
            field: 'trained',
            headerName: '',
            type: 'number',
            width: 100,
            sortable: true,
            editable: true,
            align: 'right',
            valueParser: (value, row, column, apiRef) => {
                if (value > 10) {
                    return round5(value);
                } else {
                    return value
                }
            },
            valueGetter: (value, row) => {
                return round5(reinc.getAbility(row)?.trained || row.trained)
            },
        },
    ];

    return (
        <SectionBox>
            <Suspense fallback="Loading...">
                {abilities && (
                    <Box sx={{height: 400, width: '100%', paddingLeft: '20px'}}>
                        <Typography variant='h4' textTransform={'capitalize'}>{props.type}</Typography>

                        <DataGrid
                            rows={abilities}
                            columns={columns}
                            checkboxSelection
                            disableRowSelectionOnClick
                            disableMultipleRowSelection
                            hideFooter={true}
                            disableColumnSelector
                            onRowEditStop={(params: GridRowEditStopParams, event: MuiEvent) => {
                                reinc.addOrUpdateAbility({...params.row, trained: round5(params.row.trained)})
                                params.row.trained = round5(params.row.trained)
                            }}
                        />
                    </Box>)
                }
            </Suspense>
        </SectionBox>
    )
}