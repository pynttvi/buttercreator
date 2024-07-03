'use client'
import {styled} from '@mui/material/styles';
import {Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import NumberInputBasic from './numberInput';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {useReinc} from "@/app/contexts/reincContext";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";
import {useEffect, useState} from "react";

const Item = styled(Typography)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
}));

export default function Guilds(props: { myData: CreatorDataType }) {
    const {addOrUpdateGuild, getGuild} = useReinc()
    const {creatorData} = useCreatorData()

    const setValue = (guild: GuildLevels, level: number) => {
        addOrUpdateGuild(guild, level)
    }
    const [lastClass, setLastClass] = useState("")
    const focusClass = (className: string) => {
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            const active: HTMLInputElement | null = document.querySelector(`.${className || 'none'} .base-NumberInput-input`);
            if (active) {
                active?.focus();
                active?.select();
            }
        })()
    }

    useEffect(() => {
        focusClass(lastClass)
    }, [lastClass]);

    return (
        <SectionBox title='Guilds'>
            {creatorData?.guilds ? (
                    <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 4, sm: 8, md: 12}} >
                        {creatorData?.guilds.map((g: GuildLevels, index:number) => {
                            const className = `guild-${g.name}`
                            return (
                                // @ts-ignore
                                <Grid item xs={12} sm={8} md={4} key={index}>
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
                                                    onChange={(event: {
                                                        currentTarget: HTMLInputElement;
                                                    }, value: number) => {
                                                        setValue(g, value);
                                                    }}
                                                    className={className}
                                                    value={getGuild({name: g.name.toLowerCase()})?.levels || 0}
                                                    onFocus={(event) => {
                                                        console.log("ON FOCUS");
                                                        console.log(g)
                                                        if (!getGuild({name: g.name.toLowerCase()})) {
                                                            setValue(g, g.value)
                                                        }
                                                        setLastClass(className)

                                                    }}
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