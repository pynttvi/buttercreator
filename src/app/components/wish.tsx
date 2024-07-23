'use client'
import {DataGrid, GridCallbackDetails, GridCellParams, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import React, {Suspense} from 'react';
import SectionBox from './sectionBox';
import {useReinc} from "@/app/contexts/reincContext";
import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {GridApiCommunity} from "@mui/x-data-grid/internals";
import WishHandler, {getDefaultWishes, WishWithId} from "@/app/data/wishHandler";


export default function WishList() {
    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>();
    const reinc = useReinc()
    const apiRef = React.useRef<GridApiCommunity | undefined>();

    const changeSelectionMode = (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
        setSelectionModel(rowSelectionModel)
    }
    const defaultCellProps: Partial<GridColDef<(WishWithId)>> = {
        editable: false,
        width: 200,
    }
    const columns: GridColDef<(WishWithId)>[] = [
        {
            ...defaultCellProps,
            field: 'name',
            headerName: 'Name'
        },
        {
            ...defaultCellProps,
            field: 'type',
            headerName: 'type',
            type: 'string',
            sortable: true,
        },
    ];

    const checkBoxChanged = (params: GridCellParams) => {
        const {value, row, colDef} = params
        const wishHandler = WishHandler(reinc)
        if (value === false) {
            wishHandler.apply(row.name)
        } else {
            wishHandler.cancel(row.name)
        }
    }

    return (
        <SectionBox id={'wishes'}>
            <Suspense fallback="Loading...">
                <Box sx={{height: 400}}>
                    <Typography variant='h4' textTransform={'capitalize'}
                                marginBlock={'40px'}>Wishes</Typography>
                    {reinc?.stats ? (
                        <DataGrid
                            sx={{height: 400}}
                            rows={getDefaultWishes()}
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