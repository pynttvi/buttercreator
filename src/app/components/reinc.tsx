'use client'

import React, {PropsWithChildren, Suspense, useMemo} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {useReinc} from "@/app/contexts/reincContext";
import {Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import Counters from "@/app/data/counters";
import {formatNumber} from "@/app/filters/utils";

function CostItem(props: { title: string, value: number | string }) {
    return (
        // @ts-ignore
        <Stack direction={"row"} item xs={12} sm={12} md={12} spacing={3} alignItems={"center"}
               key={`cost-${props.title}`}>
            <Typography variant={"subtitle1"} aria-label={`${props.title}-tittle`}>{props.title}</Typography>
            <Typography variant={"body1"}
                        aria-labelledby={`${props.title}-tittle`}>{props.value}</Typography>
        </Stack>
    )
}

export default function Reinc(props: PropsWithChildren<{}>) {

    const creatorDataContext = useCreatorData()
    const reinc = useReinc()
    const counters = Counters(reinc, creatorDataContext)
    const {
        countTaskPoints,
        countQpCost,
        countLevelCost,
        countLevelCostWithQps,
        countGuildLevelCost,
        countAbilitiesCost
    } = counters

    const taskPoints = useMemo(() => countTaskPoints(), [reinc.wishes])
    const qpCost = useMemo(() => countQpCost(), [reinc.level])
    const levelCost = useMemo(() => formatNumber(countLevelCost()), [reinc.level])
    const levelCostWithQps = useMemo(() => formatNumber(countLevelCostWithQps()), [reinc.level])
    const guildLevelCost = useMemo(() => formatNumber(countGuildLevelCost()), [reinc.level])
    const skillsCost = useMemo(() => formatNumber(countAbilitiesCost('skill')), [reinc.skills, reinc.race])
    const spellCosts = useMemo(() => formatNumber(countAbilitiesCost('spell')), [reinc.spells, reinc.race])
    return (
        <SectionBox>
            <Suspense fallback="Loading...">
                <Typography variant='h4' textTransform={'capitalize'}
                            marginBlock={'40px'}>Costs</Typography>
                <Box sx={{height: 400}}>
                    {/*// @ts-ignore*/}
                    <Grid container direction={'column'} item xs={12} sm={12} md={12}>
                        <CostItem title={'Taskpoints'} value={taskPoints}/>
                        <CostItem title={'Questpoints'} value={qpCost}/>
                        <CostItem title={'Level cost'} value={`${levelCostWithQps} (${levelCost} without qp)`}/>
                        <CostItem title={'Guild level cost'} value={guildLevelCost}/>
                        <CostItem title={'Skill costs'} value={skillsCost}/>
                        <CostItem title={'Spell costs'} value={spellCosts}/>
                    </Grid>

                </Box>
            </Suspense>
        </SectionBox>
    )
}