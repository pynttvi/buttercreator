'use client'

import React, {Suspense, useMemo} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {ReincContextType, useReinc} from "@/app/contexts/reincContext";
import {Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {CreatorDataContextType, useCreatorData} from "@/app/contexts/creatorDataContext";
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

const getCounters = (reinc: ReincContextType, creatorDataContext: CreatorDataContextType) => {
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
    return {
        countTaskPoints,
        countQpCost,
        countLevelCost,
        countLevelCostWithQps,
        countGuildLevelCost,
        countAbilitiesCost,
        countStats,
    }
}

export default function Costs() {

    const creatorDataContext = useCreatorData()
    const reinc = useReinc()
    const {
        countTaskPoints,
        countQpCost,
        countLevelCost,
        countLevelCostWithQps,
        countGuildLevelCost,
        countAbilitiesCost,
        countStats,
    } = useMemo(() => {
        return getCounters(reinc, creatorDataContext)
    }, [reinc, creatorDataContext])

    const taskPoints = useMemo(() => countTaskPoints(), [countTaskPoints])
    const qpCost = useMemo(() => countQpCost(), [countQpCost])
    const levelCost = useMemo(() => (countLevelCost()), [countLevelCost])
    const levelCostWithQps = useMemo(() => (countLevelCostWithQps()), [countLevelCostWithQps])
    const guildLevelCost = useMemo(() => (countGuildLevelCost()), [countGuildLevelCost])
    const skillsCost = useMemo(() => (countAbilitiesCost('skill')), [countAbilitiesCost])
    const spellCosts = useMemo(() => (countAbilitiesCost('spell')), [countAbilitiesCost])
    const statCost = useMemo(() => (countStats()), [countStats])
    const totalCost = useMemo(() => (levelCostWithQps + guildLevelCost + skillsCost.exp + spellCosts.exp + statCost), [levelCostWithQps, guildLevelCost, skillsCost, spellCosts, statCost])
    return (
        <SectionBox id={'costs'}>
            <Suspense fallback="Loading...">
                <Typography variant='h4' textTransform={'capitalize'}
                            marginBlock={'40px'}>Costs</Typography>
                <Box>
                    {/*// @ts-ignore*/}
                    <Grid container direction={'row'} xs={12} sm={12} md={12}>
                        <CostItem title={'Taskpoints'} value={formatNumber(taskPoints)}/>
                        <CostItem title={'Questpoints'} value={formatNumber(qpCost)}/>
                        <CostItem title={'Level cost'}
                                  value={`${formatNumber(levelCostWithQps)} (${formatNumber(levelCost)} without qp)`}/>
                        <CostItem title={'Guild level cost'} value={formatNumber(guildLevelCost)}/>
                        <CostItem title={'Skill costs exp'} value={formatNumber(skillsCost.exp)}/>
                        <CostItem title={'Skill costs gold'} value={formatNumber(skillsCost.gold)}/>
                        <CostItem title={'Spell costs exp'} value={formatNumber(spellCosts.exp)}/>
                        <CostItem title={'Spell costs gold'} value={formatNumber(spellCosts.gold)}/>
                        <CostItem title={'Stats costs'} value={formatNumber(statCost)}/>
                        <CostItem title={'Total cost'} value={formatNumber(totalCost)}/>
                    </Grid>

                </Box>
            </Suspense>
        </SectionBox>
    )
}