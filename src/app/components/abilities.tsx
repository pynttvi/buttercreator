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
    GridRowSelectionModel,
    GridValueGetter
} from '@mui/x-data-grid';
import React, {Suspense, useEffect, useMemo, useState} from 'react';
import {ReincAbility, useReinc} from '../contexts/reincContext';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {GridApiCommunity} from "@mui/x-data-grid/internals";
import {roundDown5, roundUp5} from "@/app/filters/utils";
import {useCreatorData} from "@/app/contexts/creatorDataContext";


export default function AbilityList(props: { type: "skills" | "spells", creatorData: CreatorDataType }) {
    const reinc = useReinc()
    const abilityType = props.type
    let abi: ReincAbility[] = (props.type === 'skills' ? reinc.filteredData.skills : reinc.filteredData.spells) || []
    const creatorDataContext = useCreatorData()
    //  const [abilities, setAbilities] = useState<ReincAbility[]>(abi)

    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>();

    const abilities = useMemo(() => {
        if (abi.length === 0 && reinc.level === 0) {
            abi = (props.type === 'skills' ? reinc.skills : reinc.spells) || []
        }

        console.debug("Abilities", abi, reinc.filteredData)
        const filtered = [...abi.filter(a => a.enabled)]
        setSelectionModel(filtered.filter(a => a.trained > 0).map(a => a.id))
        return (filtered)

    }, [reinc.filteredData, reinc.skills, reinc.spells, reinc.guilds, reinc.race, reinc.wishes, reinc.skillMax, reinc.spellMax]);


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

        if (apiRef.current?.getRowsCount() === rowSelectionModel.length) {

            const model = [...rowSelectionModel]
            const rows: ReincAbility[] = []
            model.map((id) => {
                const r = apiRef.current?.getRow(id)
                rows.push(r)
            })

            rows.forEach((r) => {
                reinc.updateAbility(props.type, {...r, trained: r.max})
            })
        }
        if (rowSelectionModel.length === 0) {
            const targetArray = props.type === "skills" ? reinc.skills : reinc.spells
            const newAbilities = targetArray.map((a) => ({...a, trained: 0}))
            reinc.updateAbility(props.type, newAbilities)

        }
        setSelectionModel(rowSelectionModel)

    }
    const checkBoxChanged = (params: GridCellParams) => {
        const {value, row, colDef} = params
        if (value === false) {
            reinc.updateAbility(props.type, {...row, trained: row.max})
            if (apiRef && apiRef.current) {
                apiRef.current.startCellEditMode({id: row.id, field: 'trained'})
            }
            setLastEdit(`edit-ability${params.row.id}`)

        } else {
            // reinc.updateAbility(props.type, {...row, trained: 0})
        }
    }

    const afterEdit = (row: ReincAbility, details: GridCallbackDetails) => {
        // reinc.addOrUpdateAbility({...row})
        // if (apiRef && apiRef.current) {
        // }
    }


    const TrainedInput = (props: { params: GridRenderEditCellParams<ReincAbility> }) => {
        const abi = props.params.row
        const max = abilityType === "skills" ? Math.min(reinc.skillMax, abi.max) : Math.min(reinc.spellMax, abi.max)
        const params = props.params
        const [value, setValue] = useState(max)
        const parse = (newValue: number) => {
            console.debug("ABILITY", params.row)
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

            //      reinc.updateAbility(params.row.type === "skill" ? "skills" : "spells", {...params.row, trained: value})

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

    const dataColumns: GridColDef<(ReincAbility)>[] = [
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
            valueGetter: (params: GridValueGetter<ReincAbility>) => {
                let max: number = params as unknown as number
                if (props.type === 'skills') {
                    max = max - Math.max(100 - reinc.skillMax, 0)
                }
                if (props.type === 'spells') {
                    max = max - Math.max(100 - reinc.spellMax, 0)
                }
                return max
            }
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


    const processRowUpdate = (newRow: ReincAbility) => {
        if (newRow.trained > 0 && newRow.trained < 10) {
            newRow.trained = 5
        }
        return reinc.updateAbility(props.type, newRow) as ReincAbility;
    };

    function showAbilityHelp(ability: ReincAbility) {
        const abilityName = ability.name.toLowerCase()
        const abilityHelpList = abilityType === "skills" ? creatorDataContext.creatorData.helpSkills : creatorDataContext.creatorData.helpSpells;
        const abilityHelp = abilityHelpList.find(ah => ah.name === abilityName)
        let text = abilityHelp?.text || ""
        if (text === "") {
            text = "No help found"
        }
        console.log("No help found", abilityName)
        reinc.setHelpText(text)
        reinc.setDrawerOpen(true)
    }

    return (
        <SectionBox id={props.type}>
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
                                if (params.field === "name") {
                                    showAbilityHelp(params.row)
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