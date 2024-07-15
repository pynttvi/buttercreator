'use client'

import React, {PropsWithChildren, Suspense, useMemo} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {useReinc} from "@/app/contexts/reincContext";
import {Divider, Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {FullGuild} from "@/app/service/guildService";
import {nanoid} from 'nanoid'

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
                    <Grid key={'training-item-' + g.name+nanoid(4)} direction={'row'} xs={6} sm={6} md={6}>
                        <Typography key={'training-name-item-' + g.name+nanoid(4)} variant={'h5'}
                                    style={{textTransform: 'capitalize'}}>{g.name}</Typography>
                        {trainedAbilities.filter((a) => a.guild?.name === g.name).map((a) => {
                            return (
                                <Typography key={'training-ability-item-' + a.name+nanoid(4)}
                                            variant={'caption'}>{a.trained / 5} {a.type === "skill" ? "train" : " study"} {a.name}; </Typography>
                            )
                        })}
                    </Grid>
                )
            })
            }
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
                            <TrainingItem key={'tr-it-' + g.name} guild={g}/>
                        )
                    })}
                </Box>
            </Suspense>
        </SectionBox>
    )
}