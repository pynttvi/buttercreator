'use client'

import React, {Suspense, useDeferredValue, useEffect, useState} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {useReinc} from "@/app/contexts/reincContext";
import {Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import Counters from "@/app/data/counters";
import {formatNumber} from "@/app/utils/utils";

function CostItem(props: { title: string, value: number | string }) {
    return (
        <Grid direction={'row'} xs={6} sm={6} md={6}>
            {/*// @ts-ignore*/}
            <Stack direction={"row"} xs={6} sm={6} md={6} spacing={1} alignItems={"center"}
                   key={`cost-${props.title}`}>
                <Typography variant={"subtitle1"} aria-label={`${props.title}-tittle`}>{props.title}</Typography>
                <Typography variant={"body1"}
                            aria-labelledby={`${props.title}-tittle`}>{props.value}</Typography>
            </Stack>
        </Grid>
    )
}

type Costs = {
    taskPoints: number
    qpCost: number
    levelCost: number
    levelCostWithQps: number
    guildLevelCost: number
    skillsCost: { exp: number, gold: number }
    spellCosts: { exp: number, gold: number }
    statCost: number
    totalCost: number
}

export default function Costs() {

    const creatorDataContext = useCreatorData()
    const reinc = useReinc()

    const [costs, setCosts] = useState<Costs>({
        guildLevelCost: 0,
        levelCost: 0,
        levelCostWithQps: 0,
        qpCost: 0,
        skillsCost: {exp: 0, gold: 0},
        spellCosts: {exp: 0, gold: 0},
        statCost: 0,
        taskPoints: 0,
        totalCost: 0
    })

    useEffect(() => {

        if (reinc.ready) {
            (async () => {

                const counters = Counters(reinc, creatorDataContext)
                const {
                    countTaskPoints,
                    countQpCost,
                    countLevelCost,
                    countLevelCostWithQps,
                    countGuildLevelCost,
                    countAbilitiesCost,
                    countStats,
                } = counters

                const taskPoints = countTaskPoints()
                const qpCost = countQpCost()
                const levelCost = countLevelCost()
                const levelCostWithQps = countLevelCostWithQps()
                const guildLevelCost = countGuildLevelCost()
                const skillsCost = countAbilitiesCost('skill')
                const spellCosts = countAbilitiesCost('spell')
                const statCost = countStats()
                const totalCost = levelCostWithQps + guildLevelCost + skillsCost.exp + spellCosts.exp + statCost

                return {
                    taskPoints,
                    qpCost,
                    levelCost,
                    levelCostWithQps,
                    guildLevelCost,
                    skillsCost,
                    spellCosts,
                    statCost,
                    totalCost
                }
            })().then((ctr: Costs) => {
                setCosts(ctr)
            })

        }
    }, [reinc.ready, reinc.guilds, reinc.skills, reinc.spells, reinc.wishes, reinc.stats]);


    return (
        <SectionBox id={'costs'}>
            <Suspense fallback="Loading...">
                <Typography variant='h4' textTransform={'capitalize'}
                            marginBlock={'40px'}>Costs</Typography>
                <Box>
                    {/*// @ts-ignore*/}
                    <Grid container direction={'row'} xs={12} sm={12} md={12}>
                        <CostItem title={'Taskpoints'} value={formatNumber(costs.taskPoints)}/>
                        <CostItem title={'Questpoints'} value={formatNumber(costs.qpCost)}/>
                        <CostItem title={'Level cost'}
                                  value={`${formatNumber(costs.levelCostWithQps)} (${formatNumber(costs.levelCost)} without qp)`}/>
                        <CostItem title={'Guild level cost'} value={formatNumber(costs.guildLevelCost)}/>
                        <CostItem title={'Skill costs exp'} value={formatNumber(costs.skillsCost.exp)}/>
                        <CostItem title={'Skill costs gold'} value={formatNumber(costs.skillsCost.gold)}/>
                        <CostItem title={'Spell costs exp'} value={formatNumber(costs.spellCosts.exp)}/>
                        <CostItem title={'Spell costs gold'} value={formatNumber(costs.spellCosts.gold)}/>
                        <CostItem title={'Stats costs'} value={formatNumber(costs.statCost)}/>
                        <CostItem title={'Total cost'} value={formatNumber(costs.totalCost)}/>
                    </Grid>

                </Box>
            </Suspense>
        </SectionBox>
    )
}