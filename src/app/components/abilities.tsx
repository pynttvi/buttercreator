'use client'
import {Input, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import {
    DataGrid,
    GRID_CHECKBOX_SELECTION_COL_DEF,
    GridCallbackDetails,
    GridCellParams,
    GridColDef,
    GridRenderEditCellParams,
    GridRowSelectionModel
} from '@mui/x-data-grid';
import React, {Suspense, useEffect, useState} from 'react';
import {useReinc} from '../contexts/reincContext';
import {Ability} from '../parsers/abilityCostParser';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {GridApiCommunity} from "@mui/x-data-grid/internals";


const roundUp5 = (n: number) => {
    return Math.ceil(n / 5) * 5;
}

const roundDown5 = (n: number) => {
    return Math.floor(n / 5) * 5;
}


export default function AbilityList(props: { type: "skills" | "spells", creatorData: CreatorDataType }) {
    const reinc = useReinc()
    const abilityType = props.type
    let abi: Ability[] = (props.type === 'skills' ? reinc.filteredData.skills : reinc.filteredData.spells) || []

    const [abilities, setAbilities] = useState<Ability[]>(abi)

    function getAbilityMax(ability: Ability){
        return reinc.guildService.maxForGuilds(ability, reinc.guilds)
    }
    useEffect(() => {
        if (abi.length === 0 && reinc.level === 0) {
            abi = (props.type === 'skills' ? reinc.skills : reinc.spells) || []
        }
        if (props.type === 'skills') {
            abi.forEach((a) => {
                a.max = (a.max === 0 ? 100 : getAbilityMax(a) || 100) - (100 - reinc.skillMax)
            })
        }
        if (props.type === 'spells') {
            abi.forEach((a) => {
                a.max = (a.max === 0 ? 100 : getAbilityMax(a) || 100) - (100 - reinc.spellMax)
            })
        }
        console.debug("Abilities", abilities)
        setAbilities([...abi])
    }, [reinc.race, reinc.filteredData, reinc.skillMax, reinc.spellMax]);


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

    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>();

    const changeSelectionMode = (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails<any>) => {
        setSelectionModel(rowSelectionModel)
    }
    const checkBoxChanged = (params: GridCellParams) => {
        const {value, row, colDef} = params
        if (value === false) {
            //      reinc.addOrUpdateAbility({...row, trained: 100})
            if (apiRef && apiRef.current) {
                apiRef.current.startCellEditMode({id: row.id, field: 'trained'})
            }
            setLastEdit(`edit-ability${params.row.id}`)

        } else {
            reinc.updateAbility(props.type, {...row, trained: 0})
        }
    }

    const afterEdit = (row: Ability, details: GridCallbackDetails) => {
        // reinc.addOrUpdateAbility({...row})
        // if (apiRef && apiRef.current) {
        // }
    }


    const TrainedInput = (props: { params: GridRenderEditCellParams<Ability> }) => {
        const max = abilityType === "skills" ? reinc.skillMax : reinc.spellMax
        const params = props.params
        const [value, setValue] = useState(reinc.level === 0 ? max : reinc.guildService.maxForGuilds(params.row, reinc.guilds))
        const parse = (newValue: number) => {
            console.log("ABILITY", params.row)
            newValue = Math.min(newValue, max)
            newValue = Math.max(newValue, 0)

            if (newValue > 10) {
                const rounded = (newValue > value) ? roundUp5(newValue) : roundDown5(newValue)
                setValue(rounded || 0)
            } else {
                setValue(newValue)
            }
        }

        useEffect(() => {
            params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: value,
            });
        }, [value]);


        return (
            <Input
                value={value}
                type={'number'}
                className={`edit-ability${params.row.id} ${params.cellMode === 'edit' ? 'active-ability' : ''}`}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updatedValue = e.target.value || "0";
                    parse(parseInt(updatedValue))
                }}
            />
        );

    }

    const dataColumns: GridColDef<(Ability)>[] = [
        {field: 'name', headerName: 'Name', filterable: true, width: 200},
        {
            field: 'trained',
            headerName: 'trained',
            type: 'number',
            width: 100,
            sortable: true,
            editable: true,
            align: 'right',
            renderEditCell: (params) => {
                return <TrainedInput params={params}/>
            },
            cellClassName: (params => {
                if (params.cellMode === 'edit') {
                    return `edit-ability${params.row.id} active-ability`
                } else {
                    return `edit-ability${params.row.id}`
                }
            })
        },
        {
            field: 'max',
            headerName: 'max',
            filterable: true,
            editable: false,
            width: 100,
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


    const processRowUpdate = (newRow: Ability) => {
        if (newRow.trained > 0 && newRow.trained < 10) {
            newRow.trained = 5
        }
        return reinc.updateAbility(props.type, newRow);
    };

    return (
        <SectionBox>
            <Suspense fallback="Loading...">
                {abilities && (
                    <Box sx={{height: 400}}>
                        <Typography variant='h4' textTransform={'capitalize'}
                                    marginBlock={'40px'}>{props.type}</Typography>

                        <DataGrid
                            rows={abilities}
                            columns={columns}
                            checkboxSelection
                            disableRowSelectionOnClick
                            hideFooter={true}
                            disableColumnSelector
                            processRowUpdate={processRowUpdate}
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