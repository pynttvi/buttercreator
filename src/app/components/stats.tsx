'use client'
import {
    DataGrid,
    GridCallbackDetails,
    GridCellParams,
    GridColDef,
    GridRenderEditCellParams,
    GridRowSelectionModel
} from '@mui/x-data-grid';
import React, {Suspense, useEffect, useState} from 'react';
import SectionBox from './sectionBox';
import {MAX_STAT, ReincContextType, ReincStat, useReinc} from "@/app/contexts/reincContext";
import {Input, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {sortById} from "@/app/utils/utils";
import {GridApiCommunity} from "@mui/x-data-grid/internals";


const TrainedInput = (props: { reinc: ReincContextType, params: GridRenderEditCellParams<ReincStat> }) => {
    const max = MAX_STAT
    const params = props.params
    const reinc = props.reinc

    const [value, setValue] = useState(reinc.stats.find((s) => {
        return s.name === params.row.name
    })?.trained || 0)

    const parse = (newValue: number) => {
        console.log("STAT", params.row)
        newValue = Math.min(newValue, max)
        newValue = Math.max(newValue, 0)
        setValue(newValue)
    }

    useEffect(() => {
        const newStats = [...reinc.stats.filter((s) => s.name !== params.row.name), {...params.row, trained: value}]
        reinc.setStats(sortById(newStats))

        params.api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: value,
        });
    }, [params.api, params.field, params.id, params.row, reinc, value]);


    return (
        <Input
            value={value}
            type={'number'}
            className={`edit-stat${params.row.id} ${params.cellMode === 'edit' ? 'active-stat' : ''}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const updatedValue = e.target.value || "0";
                parse(parseInt(updatedValue))
            }}
        />
    );

}

export default function StatsList() {
    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>();
    const reinc = useReinc()
    const apiRef = React.useRef<GridApiCommunity | undefined>();
    const [lastEdit, setLastEdit] = useState("")

    useEffect(() => {
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            const active: HTMLInputElement | null = document.querySelector(`.${lastEdit || 'none'} .MuiInputBase-input`);
            if (active) {
                active.focus();
                active.select();
            }
        })()

    }, [lastEdit]);

    const changeSelectionMode = (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
        setSelectionModel(rowSelectionModel)
    }
    const defaultCellProps: Partial<GridColDef<(ReincStat)>> = {
        width: 75,
        editable: true,
        renderEditCell: (params) => {
            return <TrainedInput reinc={reinc} params={params}/>
        },
    }
    const columns: GridColDef<(ReincStat)>[] = [
        {
            field: 'name',
            headerName: 'Name'
        },
        {
            ...defaultCellProps,
            field: 'trained',
            headerName: 'trained',
            type: 'number',
            sortable: true,
        },
    ];

    const checkBoxChanged = (params: GridCellParams) => {
        const {value, row, colDef} = params

        setLastEdit(`edit-stat${params.row.id}`)

        if (value === false) {
            const newStats = [...reinc.stats.filter((s) => s.name !== params.row.name), {...params.row, trained: 10}]
            reinc.setStats(sortById(newStats))

            apiRef?.current?.setEditCellValue({
                id: params.id,
                field: 'trained',
                value: 10,
            })
        } else {
            const newStats = [...reinc.stats.filter((s) => s.name !== params.row.name), {...params.row, trained: 0}]
            reinc.setStats(sortById(newStats))

            apiRef?.current?.setEditCellValue({
                id: params.id,
                field: 'trained',
                value: 0,
            });
        }

        apiRef?.current?.startCellEditMode({id: row.id, field: 'trained'})
        setLastEdit(`edit-stat${params.row.id}`)
    }

    return (
        <SectionBox id={'stats'}>
            <Suspense fallback="Loading...">
                <Box sx={{height: 400}}>
                    <Typography variant='h4' textTransform={'capitalize'}
                                marginBlock={'40px'}>Stats</Typography>
                    {reinc?.stats ? (
                        <DataGrid
                            sx={{height: 400}}
                            rows={reinc.stats}
                            columns={columns}
                            initialState={{}}
                            checkboxSelection
                            disableRowSelectionOnClick
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={changeSelectionMode}
                            onCellClick={(params: GridCellParams, event, details) => {
                                if (params.field === '__check__') {
                                    checkBoxChanged(params)
                                }
                            }}
                            hideFooter={true}
                            disableColumnSelector={true}
                            // @ts-ignore
                            apiRef={apiRef}
                        />
                    ) : <></>
                    }
                </Box>

            </Suspense>
        </SectionBox>
    )
}