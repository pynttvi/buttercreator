'use client'

import React, {PropsWithChildren, Suspense, useEffect, useState} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {useReinc} from "@/app/contexts/reincContext";
import {Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import Counters, {ReincResist} from "@/app/data/counters";

function CharItem(props: { title: string, value: number | string }) {
    return (
        <Grid direction={'row'} xs={12} sm={6} md={4}>
            {/*// @ts-ignore*/}
            <Stack direction={"row"} xs={6} sm={6} md={6} spacing={1} alignItems={"center"}
                   key={`cost-${props.title}`}>
                <Typography variant={"subtitle1"} aria-label={`${props.title}-tittle`}>{props.title}: </Typography>
                <Typography variant={"body1"}
                            aria-labelledby={`${props.title}-tittle`}>{props.value}</Typography>
            </Stack>
        </Grid>
    )
}

export default function CharInfo() {

    const creatorDataContext = useCreatorData()
    const [ready, setReady] = useState(false)
    const reinc = useReinc()
    if (!reinc.ready) return <></>

    const getStats = async () => {
        const counters = Counters(reinc, creatorDataContext)
        return {
            spMax: counters.getSpmax(),
            hpMax: counters.getHpmax(),
            str: counters.getReincStat("strength"),
            dex: counters.getReincStat("dexterity"),
            con: counters.getReincStat("constitution"),
            int: counters.getReincStat("intelligence"),
            wis: counters.getReincStat("wisdom"),
            cha: counters.getReincStat("charisma"),
            siz: counters.getReincStat("size"),
            hpr: counters.getReincStat("Hit point regeneration"),
            spr: counters.getReincStat("Sp_regen")
        }
    }
    const getResistances = async () => {
        const counters = Counters(reinc, creatorDataContext)
        return counters.getGuildResists()
    }
    const [stats, setStats] = useState<{
        hpMax: number,
        spMax: number,
        str: number,
        dex: number,
        con: number,
        int: number,
        wis: number,
        cha: number,
        hpr: number,
        spr: number,
        siz: number
    }>({cha: 0, con: 0, dex: 0, hpMax: 0, hpr: 0, int: 0, siz: 0, spMax: 0, spr: 0, str: 0, wis: 0})

    const [resistances, setResistances] = useState<ReincResist[]>([])
    useEffect(() => {
        setReady(false)
        getStats().then((stats) => {
            setStats(stats)
            getResistances().then((res) => {
                    setResistances(res)
                    setReady(true)
                }
            )
        })
    }, [reinc.race, reinc.filteredData, reinc.wishes, reinc.level])


    if (reinc.level === 0 || !reinc.race || !ready) {
        return <></>
    }
    return (
        <SectionBox id={'charinfo'}>
            <Suspense fallback="Loading...">
                <Typography variant='h4' textTransform={'capitalize'}
                            marginBlock={'40px'}>Char</Typography>
                <Box>
                    <Grid container direction={'row'} xs={12} sm={12} md={12} key={'char-item-content'}>
                        <Grid container direction={'row'} xs={6} sm={6} md={6} key={'base-stat-item-grid'}>
                            <CharItem key={'char-item-hpm'} title={'Hp max'} value={stats.hpMax}/>
                            <CharItem key={'char-item-spm'} title={'Sp max'} value={stats.spMax}/>
                            <CharItem key={'char-item-str'} title={'Str'} value={stats.str}/>
                            <CharItem key={'char-item-dex'} title={'Dex'} value={stats.dex}/>
                            <CharItem key={'char-item-con'} title={'Con'} value={stats.con}/>
                            <CharItem key={'char-item-int'} title={'Int'} value={stats.int}/>
                            <CharItem key={'char-item-wis'} title={'Wis'} value={stats.wis}/>
                            <CharItem key={'char-item-cha'} title={'Cha'} value={stats.cha}/>
                            <CharItem key={'char-item-hpr'} title={'Hpr'} value={stats.hpr}/>
                            <CharItem key={'char-item-spr'} title={'Spr'} value={stats.spr}/>
                            <CharItem key={'char-item-size'} title={'Size'} value={stats.siz}/>

                        </Grid>
                        <Grid container direction={'row'} xs={6} sm={6} md={6} key={'guild-resistance-item-grud'}>
                            {resistances && resistances.length > 0 && resistances.map((res) => {
                                return (
                                    <CharItem title={res.name} value={res.value}
                                              key={'guild-resistance-item-' + res.name}/>
                                )
                            })}
                        </Grid>
                    </Grid>
                </Box>
            </Suspense>
        </SectionBox>
    )
}