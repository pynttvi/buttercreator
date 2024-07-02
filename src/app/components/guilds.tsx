'use client'
import {styled} from '@mui/material/styles';
import {Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import NumberInputBasic from './numberInput';
import SectionBox from './sectionBox';
import {useDeferredValue, useEffect, useState} from 'react';
import {Guild} from "@/app/parsers/guildParser";
import {useReinc} from "@/app/contexts/reincContext";

const Item = styled(Typography)(({theme}) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    // ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    //  color: theme.palette.text.secondary,
}));

export default function Guilds(props: { myData: Map<string, any> }) {
    const {addOrUpdateGuild} = useReinc()

    const setValue = (guild: Guild, level: number) => {
        addOrUpdateGuild(guild, level)
    }

    const {creatorData: creatorData} = useReinc()
    return (
        <SectionBox title='Guilds'>
            {creatorData?.get('guilds') ? (
                    <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
                        {creatorData?.get('guilds').map((g: Guild) => {
                            return (
                                <Grid xs={3} key={g.name}>
                                    <Item>
                                        <Stack direction={'row'}>
                                            <Typography variant={'subtitle1'}
                                                        sx={{width: '70%'}}>{g.name.replaceAll("_", " ")}</Typography>
                                            <Box sx={{
                                                width: "50px",
                                                height: "30px",
                                                marginLeft: "15px",
                                                alignItems: 'center'
                                            }}>
                                                <NumberInputBasic
                                                    aria-label="guild levels input"
                                                    placeholder="0"
                                                    onChange={(_event: any, val: number) => setValue(g, val)}
                                                />
                                            </Box>
                                        </Stack>
                                    </Item>
                                </Grid>
                            )
                        })}
                    </Grid>) :
                <></>
            }
        </SectionBox>
    )
}