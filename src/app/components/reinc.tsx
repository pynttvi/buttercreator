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

export default function Reinc(props: PropsWithChildren<{}>) {

    const creatorDataContext = useCreatorData()
    const reinc = useReinc()
    const counters = Counters(reinc, creatorDataContext)
    const {countTaskPoints, countLevelCost} = counters

    const taskPoints = useMemo(() => countTaskPoints(), [reinc.wishes])
    const levelCost = useMemo(() => formatNumber(countLevelCost()), [reinc.level])
    return (
        <SectionBox>
            <Suspense fallback="Loading...">
                <Typography variant='h4' textTransform={'capitalize'}
                            marginBlock={'40px'}>Costs</Typography>
                <Box sx={{height: 400}}>
                    {/*// @ts-ignore*/}
                    <Grid container direction={'column'} item xs={12} sm={12} md={12}>
                        {/*// @ts-ignore*/}
                        <Stack direction={'row'} item xs={12} sm={12} md={12} spacing={3} alignItems={'center'}>
                            <Typography variant={'subtitle1'} aria-label={'wishcost-title'}>Taskpoints</Typography>
                            <Typography variant={'body1'}
                                        aria-labelledby={'wishcost-title'}>{taskPoints}</Typography>
                        </Stack>
                        {/*// @ts-ignore*/}
                        <Stack direction={'row'} item xs={12} sm={12} md={12} spacing={3} alignItems={'center'}>
                            <Typography variant={'subtitle1'} aria-label={'levelcost-title'}>Level cost</Typography>
                            <Typography variant={'body1'}
                                        aria-labelledby={'levelcost-title'}>{levelCost}</Typography>
                        </Stack>
                    </Grid>

                </Box>
            </Suspense>
        </SectionBox>
    )
}