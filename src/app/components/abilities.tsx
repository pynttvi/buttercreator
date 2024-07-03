'use client'
import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {DataGrid, GridColDef, GridRowEditStopParams, MuiEvent} from '@mui/x-data-grid';
import {Suspense, useDeferredValue, useEffect, useState} from 'react';
import {ReincType, useReinc} from '../contexts/reincContext';
import {Ability} from '../parsers/abilityCostParser';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {useCreatorData} from "@/app/contexts/creatorDataContext";


const round5 = (n: number) => {
    return Math.ceil(n / 5) * 5;
}

export default function AbilityList(props: { type: "skills" | "spells", creatorData: CreatorDataType }) {
    const reinc = useReinc()
    const {creatorData} = useCreatorData()
    const abilities = props.type === 'skills' ? creatorData.skills : creatorData.spells
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
                            processRowUpdate={(row:Ability, oldRow) => {
                                reinc.addOrUpdateAbility({...row, trained: round5(row.trained)})
                                row.trained = round5(row.trained)
                                return row
                            }}
                            onProcessRowUpdateError={(error) => {
                                console.error(error)
                            }}
                        />
                    </Box>)
                }
            </Suspense>
        </SectionBox>
    )
}