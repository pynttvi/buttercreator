import React, {PropsWithChildren, useMemo} from "react";
import {FullGuild} from "@/app/service/guildService";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {BaseStatName, BaseStats, baseStats, Resistances} from "@/app/parsers/raceParser";
import {capitalize} from "@/app/filters/utils";
import {Divider, Typography} from "@mui/material";
import {useReinc} from "@/app/contexts/reincContext";

type Stats = {
    id: number
} & BaseStats & Resistances


export default function HelpGuild(props: PropsWithChildren<{ guild: FullGuild }>) {

    const reinc = useReinc()
    const {guildStats, statKey, resKeys} = useMemo(() => {
        const guildStats: Stats[] = [];
        const statKey: string[] = []
        const statKeyIgnores = ["id"]

        for (let i = 1; i < props.guild.levels + 1; i++) {
            const statMap = new Map<string, any>
            const guildLevels = props.guild.levelMap.get(i.toString())
            statMap.set("id", i)
            guildLevels?.stats.forEach(st => {
                let n = st.name.trim()
                if (n === "sp_regen") {
                    n = "spr"
                }
                if (n === "hp_regen") {
                    n = "hpr"
                }
                if (n.includes("resistance")) {
                    n = n.substring(0, 3) + " res"
                }
                statMap.set(n, st.value)
            })
            guildStats.push(Object.fromEntries(statMap.entries()) as Stats)
        }

        guildStats.forEach(gs => {
            Object.entries(gs).filter((entry) => entry[1] > 0).forEach((entry) => {
                const name: typeof baseStats[number] = entry[0].toLowerCase() as BaseStatName
                if (!statKey.includes(name) && !statKeyIgnores.includes(name) && !name.includes("resistance")) {
                    statKey.push(name)
                }
            })
        })

        const resKeys: string[] = []

        guildStats.forEach(gs => {
            Object.entries(gs).filter((entry) => entry[1] > 0).forEach((entry) => {
                const name: string = entry[0].toLowerCase() as BaseStatName
                if (!resKeys.includes(name) && name.includes("res")) {
                    resKeys.push(name)
                }
            })
        })

        return {guildStats, statKey, resKeys}
    }, [reinc.helpText])

    const defaultCellProps: Partial<GridColDef> = {
        width: 75,
        editable: false
    }

    const statCols: GridColDef<(Stats)>[] = [

        {
            ...defaultCellProps,
            field: 'id',
            headerName: 'Level',
        },
        ...statKey.map((gs) => {
            return {
                ...defaultCellProps,
                field: gs,
                headerName: capitalize(gs),
            }
        }),
    ]

    const resCols: GridColDef<(Resistances)>[] = [

        {
            ...defaultCellProps,
            field: 'id',
            headerName: 'Level',
        },
        ...resKeys.map((rk) => {
            return {
                ...defaultCellProps,
                field: rk,
                headerName: capitalize(rk),
            }
        }),
    ]
    return (
        <>
            <Typography variant={'h3'} sx={{textTransform: 'capitalize'}}>{props.guild.name}</Typography>
            <Divider/>
            <Typography variant={'h5'}>Stats</Typography>
            <DataGrid
                sx={{height: 400}}
                rows={guildStats}
                columns={statCols}
                initialState={{}}
                disableRowSelectionOnClick
                disableColumnSelector={true}
                hideFooterSelectedRowCount={true}
                hideFooter={true}
                rowSelection={false}

                columnHeaderHeight={80}
            />
            <Typography
                variant={'subtitle1'}>Total:</Typography>
            <Typography variant={'body1'}> {statKey.filter(sk => !sk.includes("res")).map((sk) => {
                return sk + ": " + guildStats.map(gs => gs[sk as keyof Resistances] as number).reduce((v1, v2) => {
                    return (v1 || 0) + (v2 || 0)
                }, 0) + " "
            })}
            </Typography>

            <Divider sx={{marginTop: '20px'}}/>
            <Typography variant={'h5'}>Resistances</Typography>
            <DataGrid
                sx={{height: 400}}
                rows={guildStats}
                columns={resCols}
                initialState={{}}
                disableRowSelectionOnClick
                disableColumnSelector={true}
                hideFooterSelectedRowCount={true}
                hideFooter={true}
                rowSelection={false}

                columnHeaderHeight={80}
            />
            <Typography
                variant={'subtitle1'}>Total:</Typography>
            <Typography variant={'body1'}> {statKey.filter(sk => sk.includes("res")).map((sk) => {
                return sk + ": " + guildStats.map(gs => gs[sk as keyof Resistances]).reduce((v1, v2) => {
                    return (v1 || 0) + (v2 || 0)
                }, 0) + " "
            })}
            </Typography>

        </>
    )
}