'use client'
import Box from '@mui/material/Box';
import { DataGrid, GridCellEditStopParams, GridCellEditStopReasons, GridColDef, GridRowEditStopParams, MuiEvent } from '@mui/x-data-grid';
import { Suspense, useCallback, useDeferredValue, useEffect, useState } from 'react';
import SectionBox from './sectionBox';
import { nanoid } from 'nanoid'
import { Stack, Typography } from '@mui/material';
import { Ability } from '../parsers/abilityCostParser';
import { ReincType, useReinc } from '../contexts/reincContext';

const columns: GridColDef<(Ability[])[]>[] = [
    { field: 'name', headerName: 'Name', width: 300, filterable: true },
    {
        field: 'trained',
        headerName: '',
        type: 'number',
        width: 100,
        sortable: true,
        editable: true,
        align: 'right',
        valueParser: (value, row, column, apiRef) => {
            console.log(row)
            if (value > 10) {
                return round5(value);
            } else {
                return value
            }
        },
    },
];

const round5 = (n: number) => {
    return Math.ceil(n / 5) * 5;
}

const setValue = (event, val) => {

}
export default function AbilityList(props: { type: "skills" | "spells", myData: Promise<Map<string, any>> }) {
    const [data, setData] = useState(new Map<string, any>)
    const deferredData = useDeferredValue(data)
    const reinc: ReincType = useReinc()

    useEffect(() => {
        props.myData?.then((p) => { setData(p) })
    }, [props.myData])
    return (
        <SectionBox >
            <Suspense fallback="Loading...">
                {deferredData?.get(props.type) ? (
                    <Box sx={{ height: 400, width: '100%', paddingLeft: '20px' }}>
                        <Typography variant='h4' textTransform={'capitalize'}>{props.type}</Typography>

                        <DataGrid
                            rows={deferredData?.get(props.type)}
                            columns={columns}
                            initialState={{

                            }}
                            checkboxSelection
                            disableRowSelectionOnClick
                            disableMultipleRowSelection
                            hideFooter={true}
                            disableColumnSelector
                            onRowEditStop={(params: GridRowEditStopParams, event: MuiEvent) => {
                                reinc.addOrUpdateAbility({...params.row, trained: round5(params.row.trained)})
                                console.log(reinc.skills)
                            }}
                        />
                    </Box>) : <></>
                }
            </Suspense>
        </SectionBox>
    )
}