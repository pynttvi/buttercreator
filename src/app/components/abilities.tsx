'use client'
import {Input, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {
    DataGrid,
    GRID_CHECKBOX_SELECTION_COL_DEF,
    GridCallbackDetails,
    GridCellParams,
    GridColDef, GridRenderEditCellParams, GridRowParams,
    GridRowSelectionModel, MuiBaseEvent, MuiEvent, useGridApiContext
} from '@mui/x-data-grid';
import React, {Children, Suspense, useEffect, useState} from 'react';
import {useReinc} from '../contexts/reincContext';
import {Ability} from '../parsers/abilityCostParser';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import {GridApiCommunity} from "@mui/x-data-grid/internals";
import {width} from "@mui/system";
import {number} from "prop-types";


const round5 = (n: number) => {
    return Math.ceil(n / 5) * 5;
}


export default function AbilityList(props: { type: "skills" | "spells", creatorData: CreatorDataType }) {
    const reinc = useReinc()
    const {creatorData} = useCreatorData()
    const abilities = props.type === 'skills' ? creatorData.skills : creatorData.spells

    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>();
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

    const changeSelectionMode = (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails<any>) => {
        setSelectionModel(rowSelectionModel)
    }
    const checkBoxChanged = (params: GridCellParams) => {
        const {value, row, colDef} = params
        if (value === false) {
            reinc.addOrUpdateAbility({...row, trained: 100})
            if (apiRef && apiRef.current) {
                apiRef.current.startCellEditMode({id: row.id, field: 'trained'})
            }
            setLastEdit(`edit-ability${params.row.id}`)

        } else {
            reinc.addOrUpdateAbility({...row, trained: 0})
        }
    }

    const afterEdit = (row: Ability, details: GridCallbackDetails) => {
        reinc.addOrUpdateAbility({...row})
        if (apiRef && apiRef.current) {
        }
    }


    const dataColumns: GridColDef<(Ability)>[] = [
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
                const reincValue = reinc.getAbility(row)?.trained
                return reincValue !== undefined ? reincValue : row.trained

            },
            valueSetter: (value, row) => {
                return {...row, trained: value}
            },
            cellClassName: (params => {
                if (params.cellMode === 'edit') {
                    return `edit-ability${params.row.id} active-ability`
                } else {
                    return `edit-ability${params.row.id}`
                }
            })
        },
    ];

    const columns: GridColDef[] = React.useMemo(
        () => [
            {
                ...GRID_CHECKBOX_SELECTION_COL_DEF,
                width: 100,
            },
            ...dataColumns
        ],
        [dataColumns],
    );

    return (
        <SectionBox>
            <Suspense fallback="Loading...">
                {abilities && (
                    <Box sx={{height: 400, width: '100%', paddingLeft: '20px'}}>
                        <Typography variant='h4' textTransform={'capitalize'} marginBlock={'40px'}>{props.type}</Typography>

                        <DataGrid
                            rows={abilities}
                            columns={columns}
                            checkboxSelection
                            disableRowSelectionOnClick
                            hideFooter={true}
                            disableColumnSelector
                            processRowUpdate={(row: Ability, oldRow) => {
                                reinc.addOrUpdateAbility({...row, trained: round5(row.trained)})
                                row.trained = round5(row.trained)
                                return row
                            }}
                            onProcessRowUpdateError={(error) => {
                                console.error(error)
                            }}
                            onCellClick={(params: GridCellParams, event, details) => {
                                if (params.field === '__check__') {
                                    checkBoxChanged(params)
                                }
                            }}
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={changeSelectionMode}
                            onCellEditStop={(params, event, details) => {
                                afterEdit({...params.row, trained: params.value}, details)
                            }}
                            // @ts-ignore
                            apiRef={apiRef}
                        />
                    </Box>)
                }
            </Suspense>
        </SectionBox>
    )
}