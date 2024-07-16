'use client'
import {styled} from '@mui/material/styles';
import {Divider, Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {MAX_LEVEL, useReinc} from "@/app/contexts/reincContext";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import React, {useEffect, useMemo, useState} from "react";
import {FullGuild, GuildService, MAX_GUILD_LEVELS} from "@/app/service/guildService";
import NumberInputBasic from "@/app/components/numberInput";
import {GridDeleteIcon} from "@mui/x-data-grid";
import {trainedAbilities} from "@/app/filters/creatorDataFilters";
import {sortByName} from "@/app/filters/utils";

const Item = styled(Stack)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
}));

const DeleteGuildIcon = styled(Divider)(({theme}) => ({
    alignItems: 'center'
}));

export type GuildType = 'main' | 'sub'


function GuildItem(props: {
    guild: FullGuild,
    isSubguild: boolean,

}) {
    const [value, setValue] = useState(props.guild.trained)
    const [trainedForGuild, setTrainedFroGuild] = useState(0)
    const [disabled, setDisabled] = useState(false)
    const reinc = useReinc()
    const {
        addOrUpdateGuild,
        level, guilds,
    } = reinc

    //console.log(props.guild)
    const creatorDataContext = useCreatorData()

    const onClick = () => {
        console.debug("Trained for guild", props.guild, trainedForGuild, level)

        if (props.guild.trained === 0) {
            setValue(Math.min(props.guild.levels, MAX_GUILD_LEVELS - trainedForGuild, MAX_LEVEL - level) || 0)
        }
        focusClass(className)
    }

    useEffect(() => {
        const existingGuild = reinc.guilds.find((g) => {
            return g.name === props.guild.name || g?.mainGuild?.name === g.name
        })
        console.debug("Existing guild", existingGuild, value)
        if (existingGuild || (!existingGuild && value !== 0)) {
            addOrUpdateGuild(props.guild.guildType, props.guild, value)
        }
    }, [value]);

    function checkGuilds() {
        const trained = GuildService(creatorDataContext, reinc).trainedLevelForGuild(props.guild)
        setTrainedFroGuild(trained)
        setDisabled(trainedForGuild >= MAX_GUILD_LEVELS || level >= MAX_LEVEL || (props.guild.guildType === "sub" && trainedForGuild < 45))
    }

    useMemo(() => {
        checkGuilds();
    }, [level]);

    useEffect(() => {
        checkGuilds()
    }, [level]);

    const className = `guild-${props.guild.name} ${disabled ? 'disabled' : ''}`

    const onChange = (value: number | null) => {
        setValue(value || 0)
    }

    function deleteGuild(guild: FullGuild): void {
        let value = 0
        if (disabled || (level === MAX_LEVEL && guild.guildType === 'sub')) {
            value = 1
            addOrUpdateGuild(guild.guildType, guild, value)
            //  focusClass(className)
        } else {
            value = 0
            addOrUpdateGuild(guild.guildType, guild, value)
        }
        setValue(value)
        //    return value
    }

    const onDelete = () => {
        deleteGuild(props.guild)
        //     .then((n) => {
        //
        // })
    };

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


    return (
        <>
            <Grid direction={"row"} xs={12} sm={6} md={4} key={'index-' + props.guild.name}>
                <Box sx={{minWidth: "400px"}}>

                    <Item>
                        {/*// @ts-ignore*/}
                        <Stack direction={"row"} xs={12} sm={6} md={4} sx={{alignItems: 'center'}} key={'index-stack' + props.guild.name}>

                            <Typography variant={"subtitle1"}
                                        sx={{
                                            width: "70%",
                                            textTransform: 'capitalize',
                                            ...(props.isSubguild ? {paddingLeft: '20px'} : {})
                                        }}>{props.guild.name.replaceAll("_", " ")}
                            </Typography>
                            <Box sx={{
                                width: "50px",
                                height: "30px",
                                marginLeft: "15px",
                                alignItems: "center"
                            }}>
                                <NumberInputBasic
                                    aria-label="guild levels input"
                                    placeholder="0"
                                    onChange={(_event: any, value1: number | null) => onChange(value1)}
                                    className={className}
                                    value={props.guild.trained || 0}
                                    onClick={onClick}
                                    key={"guild-input" + props.guild.name}
                                    disabled={disabled}
                                />

                            </Box>
                            <DeleteGuildIcon>
                                {props.guild.trained > 0 && (
                                    < GridDeleteIcon key={'delete-button-' + props.guild.name}
                                                     sx={{marginLeft: '10px'}}
                                                     onClick={onDelete}/>)}
                            </DeleteGuildIcon>
                        </Stack>
                    </Item>
                </Box>
            </Grid>
            {/*!(trainedAbilities(reinc).totalCount > 0 && level === 0) &&*/}
            {sortByName<FullGuild>(props.guild.subGuilds)?.map((sg) => {
                return (
                    <GuildItem guild={sg} key={'guild-item-' + sg.name} isSubguild={true}/>
                )
            })}
        </>
    )
}

export default function Guilds(props: { myData: CreatorDataType }) {
    const reinc = useReinc()
    const {
        guilds,
        level
    } = reinc

    let data = sortByName<FullGuild>(guilds)  //creatorData

    return (
        <SectionBox title='Guilds'>
            <Grid container direction={"row"} gap={4} spacing={1} columns={{xs: 4, sm: 6, md: 12}}>
                {data ? (
                        <>
                            {data?.sort((a, b) => b.levels - a.levels).map((g: FullGuild, index: number) => {
                                const className = `guild-${g.name}`
                                return (
                                    <Box key={'guild-item-' + g.name} sx={{minWidth: "400px"}}>
                                        <GuildItem guild={g as FullGuild} isSubguild={false}/>
                                    </Box>
                                )
                            })}
                        </>) :
                    <></>
                }

            </Grid>
        </SectionBox>
    )
}