'use client'
import {styled} from '@mui/material/styles';
import {Typography} from '@mui/material';
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

const Item = styled(Typography)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
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

    const creatorDataContext = useCreatorData()

    const onClick = () => {
        if (value === 0) {
            setValue(Math.min(props.guild.levels, MAX_GUILD_LEVELS - trainedForGuild, MAX_LEVEL - level) || 0)
        }
        focusClass(className)
    }

    useEffect(() => {
        if (!(props.guild.trained === 0 && value === 0)) {
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

    async function deleteGuild(guild: FullGuild): Promise<number> {
        let value = 0
        if (disabled || level === MAX_LEVEL) {
            value = 1
            addOrUpdateGuild(guild.guildType, guild, value)
            focusClass(className)
        } else {
            value = 0
            addOrUpdateGuild(guild.guildType, guild, value)
        }
        return value
    }

    const onDelete = () => {
        deleteGuild(props.guild).then((n) => {
            setValue(n)
        })
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
            {/*// @ts-ignore*/}
            <Grid item direction={"row"} xs={12} sm={6} md={4} key={'index-' + props.guild.name}>
                <Box sx={{minWidth: "400px"}}>

                    <Item>
                        <Typography variant={"subtitle1"}
                                    sx={{
                                        width: "70%",
                                        textTransform: 'capitalize',
                                        ...(props.isSubguild ? {paddingLeft: '20px'} : {})
                                    }}>{props.guild.name.replaceAll("_", " ")}
                            {value > 0 && !(!props.isSubguild && trainedForGuild > 45) && (
                                < GridDeleteIcon sx={{marginLeft: '10px'}} onClick={onDelete}/>)}</Typography>
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
                    </Item>
                </Box>
            </Grid>
            {!(trainedAbilities(reinc).totalCount > 0 && level === 0) && props.guild.subGuilds.map((sg) => {
                return (
                    <>
                        <GuildItem guild={sg} isSubguild={true}/>
                    </>
                )
            })}
        </>
    )
}

export default function Guilds(props: { myData: CreatorDataType }) {
    const reinc = useReinc()
    const {
        filteredData,
        level
    } = reinc

    let data = filteredData?.guilds  //creatorData

    //console.log("FILTERED", data, level)
    console.log("Reinc", reinc.guilds)
    useEffect(() => {

    }, [filteredData]);
    return (
        <SectionBox title='Guilds'>
            <Grid container direction={"row"} gap={4} spacing={1} columns={{xs: 4, sm: 6, md: 12}}>
                {data ? (
                        <>
                            {data?.sort((a, b) => b.levels - a.levels).map((g: FullGuild, index: number) => {
                                const className = `guild-${g.name}`
                                return (
                                    // @ts-ignore
                                    <Box sx={{minWidth: "400px"}}>
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