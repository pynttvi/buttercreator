'use client'

import React, {PropsWithChildren, Suspense} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {useReinc} from "@/app/contexts/reincContext";
import {Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import Counters from "@/app/data/counters";

export default function Reinc(props: PropsWithChildren<{}>) {

    const creatorDataContext = useCreatorData()
    const reinc = useReinc()
    const counters = Counters(reinc, creatorDataContext)
    const {countTaskPoints} = counters
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
                                        aria-labelledby={'wishcost-title'}>{countTaskPoints()}</Typography>
                        </Stack>
                    </Grid>

                </Box>
            </Suspense>
        </SectionBox>
    )
}