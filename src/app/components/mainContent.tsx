"use client";
import AbilityList from "@/app/components/abilities";
import Costs from "@/app/components/costs";
import PersistentDrawerRight from "@/app/components/drawer";
import Guilds from "@/app/components/guilds";
import CharInfo from "@/app/components/info";
import LoadingFallback from "@/app/components/loadingFallback";
import RaceList from "@/app/components/races";
import StatsList from "@/app/components/stats";
import Training from "@/app/components/training";
import WishList from "@/app/components/wish";
import Grid from "@mui/material/Unstable_Grid2";
import { Provider } from "react-redux";
import { useAppDispatch, useInitializer, useReinc } from "../redux/hooks";
import reincStore from "../redux/reincStore";
import { useEffect } from "react";
import { recomputeReinc } from "../redux/reincReducer";

export function Buttercreator() {
  const dispatch = useAppDispatch();
  const reinc = useReinc();

  useEffect(() => {
    if (!reinc.ready) return;
    dispatch(recomputeReinc());
  }, [dispatch, reinc]);

  if (!reinc.ready) {
    return <LoadingFallback />;
  }

  return (
    <Grid
      container
      spacing={{ xs: 2, md: 3 }}
      columns={{ xs: 12, sm: 12, md: 12 }}
    >
      <Grid xs={12} sm={12} md={12}>
        <RaceList key={"race-section"} />
      </Grid>
      <Grid xs={12} sm={12} md={12}>
        <Guilds key={"guild-section"} />
      </Grid>
      <Grid xs={12} sm={12} md={12} lg={6}>
        <AbilityList key={"skill-section"} type={"skills"} />
      </Grid>
      <Grid xs={12} sm={12} md={12} lg={6}>
        <AbilityList key={"spell-section"} type={"spells"} />
      </Grid>
      <Grid xs={12} sm={12} md={6} lg={6}>
        <StatsList />
      </Grid>
      <Grid xs={12} sm={12} md={6} lg={6}>
        <WishList key={"race-section"} />
      </Grid>
      <Grid xs={12} sm={12} md={12}>
        <Costs key={"cost-section"} />
      </Grid>
      <Grid xs={12} sm={12} md={12}>
        <CharInfo key={"char-section"} />
      </Grid>
      <Grid xs={12} sm={12} md={12}>
        <Training key={"training-section"} />
      </Grid>
    </Grid>
  );
}

export function ButterCreatorApp(props: {}) {
  const { initialized } = useInitializer();
  return (
    <>
      {!initialized && <LoadingFallback />}
      {initialized && (
        <PersistentDrawerRight>
          <Buttercreator />
        </PersistentDrawerRight>
      )}
    </>
  );
}

export default function MainContent(props: {}) {
  return (
    <Provider store={reincStore}>
      <ButterCreatorApp />
    </Provider>
  );
}
