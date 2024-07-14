'use client'
import {Typography} from "@mui/material";
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

export function Buttercreator(props: { creatorDataContext: CreatorDataContextType }) {
    return <Suspense fallback={"Loading..."}>
        <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 12, sm: 12, md: 12}}>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={12}>
                <RaceList myData={props.creatorDataContext.creatorData}/>
            </Grid>

            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={12}>
                <Guilds myData={props.creatorDataContext.creatorData}/>
            </Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={12} lg={6}>
                <AbilityList type={"skills"} creatorData={props.creatorDataContext.creatorData}/>
            </Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={12} lg={6}>
                <AbilityList type={"spells"} creatorData={props.creatorDataContext.creatorData}/>
            </Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <StatsList/>
            </Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <WishList/>
            </Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={12}>
                <Costs/>
            </Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={12} md={12}>
                <Training/>
            </Grid>
        </Grid>
    </Suspense>;
}

export default function MainContent(props: { myData: Promise<Partial<CreatorDataType>> }) {

    return (
        <CreatorDataContextProvider creatorData={props.myData as Promise<CreatorDataType>}>
            <CreatorDataContext.Consumer>
                {value => (
                    !value?.creatorData ? (<Typography variant={'h2'}> Loading...</Typography>)
                        : (
                            <ReincContextProvider creatorDataContext={value}>
                                <Buttercreator key={'buttercrator'} creatorDataContext={value}/>
                            </ReincContextProvider>
                        )
                )}
            </CreatorDataContext.Consumer>
        </CreatorDataContextProvider>

    )
}