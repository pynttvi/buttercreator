'use client'
import {SvgIcon, Typography} from "@mui/material";
import RaceList from "@/app/components/races";
import Guilds from "@/app/components/guilds";
import AbilityList from "@/app/components/abilities";
import Costs from "@/app/components/costs";
import {PropsWithChildren, Suspense, useEffect, useState} from "react";
import {ReincContextProvider} from "@/app/contexts/reincContext";
import {CreatorDataType} from "@/app/parserFactory";
import {
    CreatorDataContext,
    CreatorDataContextProvider,
    CreatorDataContextType
} from "@/app/contexts/creatorDataContext";
import Grid from "@mui/material/Unstable_Grid2";
import StatsList from "@/app/components/stats";
import WishList from "@/app/components/wish";
import Training from "@/app/components/training";
import PersistentDrawerRight from "@/app/components/drawer";
import CharInfo from "@/app/components/info";
import Box from "@mui/material/Box";
function loadWord() {
    const things = ['Spellcaster', 'Hitter', 'Bard', "Thief", "Mage", "Fighter", "Troll", "Goblin", "Vampire", "Cherub", "Bad", "Good", "Very Bad", "Very Good"];
    return things[Math.floor(Math.random() * things.length)];
}

export type Loading = {}


const LoadingFallback = () => {
    return (
        <>
            <Typography variant={'h4'}
                        sx={{textTransform: 'capitalize'}}>Butterscotc, 120lvl, {loadWord()} The {loadWord()}-{loadWord()}....... {loadWord()}</Typography>
            <Typography variant={'body1'}>Loading...</Typography>
            <Box>
                <img src="/favicon.svg" alt="Logo" width={'70%'} height={'70%'}/>
            </Box>
        </>
    )
}

export function Buttercreator(props: { creatorDataContext: CreatorDataContextType }) {
    const [fallBack, setFallback] = useState(<LoadingFallback/>)
    useEffect(() => {
        setFallback(<LoadingFallback />)
    }, []);
    return <Suspense fallback={fallBack}>
        <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 12, sm: 12, md: 12}}>
            <Grid xs={12} sm={12} md={12}>
                <RaceList key={'race-section'} myData={props.creatorDataContext.creatorData}/>
            </Grid>
            <Grid xs={12} sm={12} md={12}>
                <Guilds key={'guild-section'} myData={props.creatorDataContext.creatorData}/>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6}>
                <AbilityList key={'skill-section'} type={"skills"} creatorData={props.creatorDataContext.creatorData}/>
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6}>
                <AbilityList key={'spell-section'} type={"spells"} creatorData={props.creatorDataContext.creatorData}/>
            </Grid>
            <Grid xs={12} sm={12} md={6} lg={6}>
                <StatsList/>
            </Grid>
            <Grid xs={12} sm={12} md={6} lg={6}>
                <WishList key={'race-section'}/>
            </Grid>
            <Grid xs={12} sm={12} md={12}>
                <Costs key={'cost-section'}/>
            </Grid>
            <Grid xs={12} sm={12} md={12}>
                <CharInfo key={'charinfo-section'}/>
            </Grid>
            <Grid xs={12} sm={12} md={12}>
                <Training key={'training-section'}/>
            </Grid>
        </Grid>
    </Suspense>;
}

export default function MainContent(props: { myData: Promise<Partial<CreatorDataType>>, title?: Promise<string> }) {

    return (
        <CreatorDataContextProvider creatorData={props.myData as Promise<CreatorDataType>} title={props.title}>
            <CreatorDataContext.Consumer>
                {value => (
                    !value?.creatorData ? (<LoadingFallback/>)
                        : (
                            <ReincContextProvider creatorDataContext={value}>
                                <PersistentDrawerRight>
                                    <Buttercreator key={'buttercrator'} creatorDataContext={value}/>
                                </PersistentDrawerRight>
                            </ReincContextProvider>
                        )
                )}
            </CreatorDataContext.Consumer>
        </CreatorDataContextProvider>

    )
}