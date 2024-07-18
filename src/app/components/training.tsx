'use client'

import React, {PropsWithChildren, Suspense, useMemo} from "react"
import SectionBox from "@/app/components/sectionBox";
import Box from "@mui/material/Box";
import {ReincAbility, useReinc} from "@/app/contexts/reincContext";
import {Divider, Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {FullGuild} from "@/app/service/guildService";
import {nanoid} from 'nanoid'

const getTrainingText = (a: ReincAbility, separator: string) => {
    const count = a.trained / 5
    let text = "";

    if (count <= 20) {
        text += `${count} ${a.type === "skill" ? "train" : " study"} ${a.name}${separator}`;
    } else {
        text += `${20} ${a.type === "skill" ? "train" : " study"} ${a.name}${separator}`;
        text += `${count - 20} ${a.type === "skill" ? "train" : " study"} ${a.name}${separator}`;
    }
    return text
}

function TrainingItem(props: { guild: FullGuild }) {
    const guild: FullGuild = props.guild
    const reinc = useReinc()
    const trainedAbilities = useMemo(() => {
        return reinc.filteredData.skills.concat(reinc.filteredData.spells).filter((s) => s.trained > 0 && s.enabled)
    }, [reinc.filteredData, reinc.level])
    return (
        <>
            {guild.subGuilds.filter((sg) => sg.trained > 0).map((g) => {
                return (
                    <Grid key={'training-item-' + g.name + nanoid(4)} direction={'row'} xs={6} sm={6} md={6}>
                        <Typography key={'training-name-item-' + g.name + nanoid(4)} variant={'body1'}
                                    style={{textTransform: 'capitalize'}}>{g.name}</Typography>
                        {trainedAbilities.filter((a) => a.guild?.name === g.name).map((a) => {
                            return (
                                <Typography key={'training-ability-item-' + a.name + nanoid(4)}
                                            variant={'caption'}>{getTrainingText(a,reinc.copyPasteSeparator)}</Typography>
                            )
                        })}
                    </Grid>
                )
            })
            }{
            guild.trained > 0 && (
                <Grid key={'training-item-' + guild.name + nanoid(4)} direction={'row'} xs={6} sm={6} md={6}>
                    <Typography key={'training-name-item-' + guild.name + nanoid(4)} variant={'body1'}
                                style={{textTransform: 'capitalize'}}>{guild.name}</Typography>
                    {trainedAbilities.filter((a) => a.guild?.name === guild.name).map((a) => {
                        return (
                            <Typography key={'training-ability-item-' + a.name + nanoid(4)}
                                        variant={'caption'}>{getTrainingText(a,reinc.copyPasteSeparator)}</Typography>
                        )
                    })}
                </Grid>
            )}
        </>
    )
}

export default function Training(props: PropsWithChildren<{}>) {

    const reinc = useReinc()

    return (
        <SectionBox id={'training'}>
            <Suspense fallback="Loading...">
                <Typography variant='h4' textTransform={'capitalize'}
                            marginBlock={'40px'}>Training</Typography>
                <Box sx={{height: 400}}>
                    {reinc?.guilds && reinc.guilds.map((g) => {
                        return (
                            <TrainingItem key={'tr-it-' + g.name} guild={g}/>
                        )
                    })}
                    {(!reinc.skills || reinc.skills.filter(s => s.trained > 0 && s.enabled).length === 0) && (!reinc.spells ||
                        reinc.spells.filter(s => s.trained > 0 && s.enabled).length === 0) && (
                        <Typography variant={'subtitle1'}>No skills or spells trained</Typography>
                    )}
                </Box>
            </Suspense>
        </SectionBox>
    )
}