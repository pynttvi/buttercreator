"use client";

import SectionBox from "@/app/components/sectionBox";
import { formatNumber } from "@/app/utils/utils";
import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import { PropsWithChildren, Suspense, useMemo } from "react";
import { useCounters } from "../data/counters";
import { useAppSelector } from "../redux/hooks";
import LoadingFallback from "./loadingFallback";

function CostItem(props: { title: string; value: number | string }) {
  return (
    <Grid direction={"row"} xs={6} sm={6} md={6}>
      {/*// @ts-ignore*/}
      <Stack
        direction={"row"}
        xs={6}
        sm={6}
        md={6}
        spacing={1}
        alignItems={"center"}
        key={`cost-${props.title}`}
      >
        <Typography variant={"subtitle1"} aria-label={`${props.title}-tittle`}>
          {props.title}
        </Typography>
        <Typography variant={"body1"} aria-labelledby={`${props.title}-tittle`}>
          {props.value}
        </Typography>
      </Stack>
    </Grid>
  );
}

export default function Costs(props: PropsWithChildren<{}>) {
  const reincReady = useAppSelector(
    (state) => state.reducer.reincContext.ready,
  );
  const level = useAppSelector((state) => state.reducer.reincContext.level);
  const counters = useCounters();

  const taskPoints = useMemo(() => counters.countTaskPoints(), [counters]);

  const qpCost = useMemo(() => counters.countQpCost(), [counters]);

  const levelCost = useMemo(
    () => counters.countLevelCost(level),
    [counters, level],
  );

  const levelCostWithQps = useMemo(
    () => counters.countLevelCostWithQps(),
    [counters],
  );

  const guildLevelCost = useMemo(
    () => counters.countGuildLevelCost(),
    [counters],
  );

  const skillsCost = useMemo(
    () => counters.countAbilitiesCost("skill"),
    [counters],
  );

  const spellCosts = useMemo(
    () => counters.countAbilitiesCost("spell"),
    [counters],
  );

  const statCost = useMemo(() => counters.countStats(), [counters]);

  const totalCost =
    levelCostWithQps +
    guildLevelCost +
    skillsCost.exp +
    spellCosts.exp +
    statCost;

  if (!reincReady) {
    return <LoadingFallback />;
  }

  return (
    <SectionBox id={"costs"}>
      <Suspense fallback="Loading...">
        <Typography
          variant="h4"
          textTransform={"capitalize"}
          marginBlock={"40px"}
        >
          Costs
        </Typography>
        <Box>
          {/*// @ts-ignore*/}
          <Grid container direction={"row"} xs={12} sm={12} md={12}>
            <CostItem title={"Taskpoints"} value={formatNumber(taskPoints)} />
            <CostItem title={"Questpoints"} value={formatNumber(qpCost)} />
            <CostItem
              title={"Level cost"}
              value={`${formatNumber(levelCostWithQps)} (${formatNumber(levelCost)} without qp)`}
            />
            <CostItem
              title={"Guild level cost"}
              value={formatNumber(guildLevelCost)}
            />
            <CostItem
              title={"Skill costs exp"}
              value={formatNumber(skillsCost.exp)}
            />
            <CostItem
              title={"Skill costs gold"}
              value={formatNumber(skillsCost.gold)}
            />
            <CostItem
              title={"Spell costs exp"}
              value={formatNumber(spellCosts.exp)}
            />
            <CostItem
              title={"Spell costs gold"}
              value={formatNumber(spellCosts.gold)}
            />
            <CostItem title={"Stats costs"} value={formatNumber(statCost)} />
            <CostItem title={"Total cost"} value={formatNumber(totalCost)} />
          </Grid>
        </Box>
      </Suspense>
    </SectionBox>
  );
}
