'use client'
import RaceList from "@/app/components/races";
import Guilds from "@/app/components/guilds";
import AbilityList from "@/app/components/abilities";
import Costs from "@/app/components/costs";
import {Suspense} from "react";
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
import LoadingFallback from "@/app/components/loadingFallback";
import {AbilityContextProvider} from "@/app/contexts/abilityContext";
import {GuildContextProvider} from "@/app/contexts/guildContext";


export function Buttercreator(props: { creatorDataContext: CreatorDataContextType }) {

    return <Suspense fallback={<LoadingFallback/>}>
        <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 12, sm: 12, md: 12}}>
            <Grid xs={12} sm={12} md={12}>
                <RaceList key={'race-section'} />
            </Grid>
            <GuildContextProvider>
                <Grid xs={12} sm={12} md={12}>
                    <Guilds key={'guild-section'}/>
                </Grid>
            </GuildContextProvider>
            <AbilityContextProvider>

                <Grid xs={12} sm={12} md={12} lg={6}>
                    <AbilityList key={'skill-section'} type={"skills"} />
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={6}>
                    <AbilityList key={'spell-section'} type={"spells"} />
                </Grid>
            </AbilityContextProvider>
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
                <CharInfo key={'char-section'}/>
            </Grid>
            <Grid xs={12} sm={12} md={12}>
                <Training key={'training-section'}/>
            </Grid>
        </Grid>
    </Suspense>;
}

export default function MainContent(props: { myData: Promise<Partial<CreatorDataType>> }) {

    return (
        <CreatorDataContextProvider creatorData={props.myData as Promise<CreatorDataType>}>
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