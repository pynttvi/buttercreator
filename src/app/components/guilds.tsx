'use client'
import {styled} from '@mui/material/styles';
import {Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import NumberInputBasic from './numberInput';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {ReincGuild, useReinc} from "@/app/contexts/reincContext";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";
import {FocusEventHandler, useEffect, useState} from "react";

const Item = styled(Typography)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
}));

function GuildItem(props: {
    g: GuildLevels,
    onChange: (event: { currentTarget: HTMLInputElement }, value: number) => void,
    className: string,
    guild: ReincGuild | undefined,
    onFocus: FocusEventHandler<Element>
    isSubguild?: boolean
}) {
    return (
        // @ts-ignore
        <Grid item direction={"row"} xs={12} sm={6} md={4} key={'index-' + props.g.name}>
            <Box sx={{minWidth:"400px"}}>

            <Item>
                    <Typography variant={"subtitle1"}
                                sx={{
                                    width: "70%",
                                    textTransform: 'capitalize',
                                    ...(props.isSubguild ? {paddingLeft: '20px'} : {})
                                }}>{props.g.name.replaceAll("_", " ")}</Typography>
                    <Box sx={{
                        width: "50px",
                        height: "30px",
                        marginLeft: "15px",
                        alignItems: "center"
                    }}>
                        <NumberInputBasic
                            aria-label="guild levels input"
                            placeholder="0"
                            onChange={props.onChange}
                            className={props.className}
                            value={props.guild?.levels || 0}
                            onFocus={props.onFocus}
                        />
                </Box>
            </Item>
            </Box>
        </Grid>
    )
}

export default function Guilds(props: { myData: CreatorDataType }) {
    const {addOrUpdateGuild, getReincGuildByGuildLevels, getSubguildsByGuildName} = useReinc()
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
            <Grid container direction={"row"} gap={4} spacing={1} columns={{xs: 4, sm: 6, md: 12}}>
                    {creatorData?.guilds ? (
                            <>
                                {creatorData?.guilds.sort((a,b) => b.value - a.value).map((g: GuildLevels, index: number) => {
                                    const className = `guild-${g.name}`
                                    return (
                                        // @ts-ignore
                                        <Box sx={{minWidth:"400px"}}>
                                            <GuildItem g={g}
                                                       onChange={(event: {
                                                           currentTarget: HTMLInputElement;
                                                       }, value: number) => {
                                                           setValue(g, value);
                                                       }}
                                                       className={className}
                                                       guild={getReincGuildByGuildLevels({name: g.name.toLowerCase()})}
                                                       onFocus={(event) => {
                                                           if (!getReincGuildByGuildLevels({name: g.name.toLowerCase()})) {
                                                               setValue(g, g.value)
                                                           }
                                                           setLastClass(className)

                                                       }}/>
                                            {getSubguildsByGuildName(g.name).map((sg) => (
                                                <GuildItem g={sg}
                                                           onChange={(event: {
                                                               currentTarget: HTMLInputElement;
                                                           }, value: number) => {
                                                               setValue(sg, value);
                                                           }}
                                                           className={className}
                                                           guild={getReincGuildByGuildLevels({name: sg.name.toLowerCase()})}
                                                           onFocus={(event) => {
                                                               if (!getReincGuildByGuildLevels({name: sg.name.toLowerCase()})) {
                                                                   setValue(sg, sg.value)
                                                               }
                                                               setLastClass(className)

                                                           }}
                                                           isSubguild={true}
                                                />
                                            ))}
                                        </Box>
                                    )
                                })}
                            </>) :
                        <Box></Box>
                    }

            </Grid>
        </SectionBox>
    )
}