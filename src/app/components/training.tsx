'use client'

import React, {PropsWithChildren, Suspense, useMemo} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {useReinc} from "@/app/contexts/reincContext";
import {Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {FullGuild} from "@/app/service/guildService";

function TrainingItem(props: { guild: FullGuild }) {
    const guild: FullGuild = props.guild
    const reinc = useReinc()
    const trainedAbilities = useMemo(() => {
        return reinc.skills.concat(reinc.spells).filter((s) => s.trained > 0)
    }, [reinc.skills, reinc.skills, reinc.level])
    return (
        <>
            {guild.subGuilds.filter((sg) => sg.trained > 0).map((g) => {
                return (
                    <>
                        <Typography variant={'h5'} style={{textTransform: 'capitalize'}}>{g.name}</Typography>
                        {trainedAbilities.filter((a) => a.guild?.name === g.name).map((a) => {
                            return (
                                <Typography
                                    variant={'caption'}>{a.trained / 5} {a.type === "skill" ? "train" : " study"} {a.name}; </Typography>
                            )
                        })}
                    </>
                )
            })
            }
            {/*// @ts-ignore*/}
            <Grid item direction={'row'} xs={6} sm={6} md={6}>

            </Grid>
        </>
    )
}

export default function Training(props: PropsWithChildren<{}>) {

    const reinc = useReinc()

    return (
        <SectionBox>
            <Suspense fallback="Loading...">
                <Typography variant='h4' textTransform={'capitalize'}
                            marginBlock={'40px'}>Training</Typography>
                <Box sx={{height: 400}}>
                    {reinc?.guilds && reinc.guilds.map((g) => {
                        return (
                            <TrainingItem guild={g}/>
                        )
                    })}
                    {/*// @ts-ignore*/}
                    <Grid container direction={'row'} item xs={12} sm={12} md={12}>

                    </Grid>

                </Box>
            </Suspense>
        </SectionBox>
    )
}