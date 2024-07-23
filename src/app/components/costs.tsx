'use client'

import React, {Suspense, useMemo} from "react"
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

export default function Costs() {

    const creatorDataContext = useCreatorData()
    const reinc = useReinc()
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

    const taskPoints = useMemo(() => countTaskPoints(), [reinc.wishes])
    const qpCost = useMemo(() => countQpCost(), [reinc.level])
    const levelCost = useMemo(() => (countLevelCost()), [reinc.level])
    const levelCostWithQps = useMemo(() => (countLevelCostWithQps()), [reinc.level])
    const guildLevelCost = useMemo(() => (countGuildLevelCost()), [reinc.level])
    const skillsCost = useMemo(() => (countAbilitiesCost('skill')), [reinc.skills, reinc.race])
    const spellCosts = useMemo(() => (countAbilitiesCost('spell')), [reinc.spells, reinc.race])
    const statCost = useMemo(() => (countStats()), [reinc.stats])
    const totalCost = useMemo(() => (levelCostWithQps + guildLevelCost + skillsCost.exp + spellCosts.exp + statCost), [levelCost, guildLevelCost, skillsCost, spellCosts, statCost])
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