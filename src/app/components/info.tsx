'use client'

import React, {PropsWithChildren, Suspense, useMemo} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {ReincContextType, useReinc} from "@/app/contexts/reincContext";
import {Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import Counters from "@/app/data/counters";
import {formatNumber} from "@/app/utils/utils";

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

export default function CharInfo(props: PropsWithChildren<{}>) {

    const creatorDataContext = useCreatorData()
    const reinc = useReinc()
    const {
        hpMax,
        spMax,
        str,
        dex,
        con,
        int,
        wis,
        cha,
        hpr,
        spr,
        siz
    } = useMemo(() => {
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
    }, [reinc.race, reinc.filteredData, reinc.wishes, reinc.level])

    const resistances = useMemo(() => {
        const counters = Counters(reinc, creatorDataContext)
        return counters.getGuildResists()
    }, [reinc.race, reinc.filteredData, reinc.wishes, reinc.level])

    if (reinc.level === 0 || !reinc.race) {
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
                            <CharItem key={'char-item-hpm'} title={'Hp max'} value={hpMax}/>
                            <CharItem key={'char-item-spm'} title={'Sp max'} value={spMax}/>
                            <CharItem key={'char-item-str'} title={'Str'} value={str}/>
                            <CharItem key={'char-item-dex'} title={'Dex'} value={dex}/>
                            <CharItem key={'char-item-con'} title={'Con'} value={con}/>
                            <CharItem key={'char-item-int'} title={'Int'} value={int}/>
                            <CharItem key={'char-item-wis'} title={'Wis'} value={wis}/>
                            <CharItem key={'char-item-cha'} title={'Cha'} value={cha}/>
                            <CharItem key={'char-item-hpr'} title={'Hpr'} value={hpr}/>
                            <CharItem key={'char-item-spr'} title={'Spr'} value={spr}/>
                            <CharItem key={'char-item-size'} title={'Size'} value={siz}/>

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