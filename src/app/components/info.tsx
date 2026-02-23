"use client";

import SectionBox from "@/app/components/sectionBox";
import { useCounters } from "@/app/data/counters";
import { Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import {
  PropsWithChildren,
  Suspense,
  useMemo,
  useState
} from "react";
import { useAppSelector } from "../redux/hooks";
import { selectLevel, selectRace } from "../redux/selectors";

function CharItem(props: { title: string; value: number | string }) {
  return (
    <Grid direction={"row"} xs={12} sm={6} md={4}>
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
          {props.title}:{" "}
        </Typography>
        <Typography variant={"body1"} aria-labelledby={`${props.title}-tittle`}>
          {props.value}
        </Typography>
      </Stack>
    </Grid>
  );
}

export default function CharInfo(props: PropsWithChildren<{}>) {
  const [ready, setReady] = useState(false);
  const counters = useCounters();
  const level = useAppSelector(selectLevel);
  const race = useAppSelector(selectRace);

  const stats = useMemo(() => {
    return {
      spMax: counters.getSpmax(),
      hpMax: counters.getHpmax(),
      str: counters.getReincStat("strength"),
      dex: counters.getReincStat("dexterity"),
      con: counters.getReincStat("constitution"),
      int: counters.getReincStat("intelligence"),
      wis: counters.getReincStat("wisdom"),
      cha: counters.getReincStat("charisma"),
      siz: counters.getReincStat("size"),
      hpr: counters.getReincStat("Hit point regeneration"),
      spr: counters.getReincStat("Sp_regen"),
    };
  }, [counters]);

  const resistances = useMemo(() => {
    return counters.getGuildResists();
  }, [counters]);

  if (level === 0 || !race || !ready) {
    return <></>;
  }

  if (!ready) return <></>;

  return (
    <SectionBox id={"charinfo"}>
      <Suspense fallback="Loading...">
        <Typography
          variant="h4"
          textTransform={"capitalize"}
          marginBlock={"40px"}
        >
          Char
        </Typography>
        <Box>
          <Grid
            container
            direction={"row"}
            xs={12}
            sm={12}
            md={12}
            key={"char-item-content"}
          >
            <Grid
              container
              direction={"row"}
              xs={6}
              sm={6}
              md={6}
              key={"base-stat-item-grid"}
            >
              <CharItem
                key={"char-item-hpm"}
                title={"Hp max"}
                value={stats.hpMax}
              />
              <CharItem
                key={"char-item-spm"}
                title={"Sp max"}
                value={stats.spMax}
              />
              <CharItem key={"char-item-str"} title={"Str"} value={stats.str} />
              <CharItem key={"char-item-dex"} title={"Dex"} value={stats.dex} />
              <CharItem key={"char-item-con"} title={"Con"} value={stats.con} />
              <CharItem key={"char-item-int"} title={"Int"} value={stats.int} />
              <CharItem key={"char-item-wis"} title={"Wis"} value={stats.wis} />
              <CharItem key={"char-item-cha"} title={"Cha"} value={stats.cha} />
              <CharItem key={"char-item-hpr"} title={"Hpr"} value={stats.hpr} />
              <CharItem key={"char-item-spr"} title={"Spr"} value={stats.spr} />
              <CharItem
                key={"char-item-size"}
                title={"Size"}
                value={stats.siz}
              />
            </Grid>
            <Grid
              container
              direction={"row"}
              xs={6}
              sm={6}
              md={6}
              key={"guild-resistance-item-grud"}
            >
              {resistances &&
                resistances.length > 0 &&
                resistances.map((res) => {
                  return (
                    <CharItem
                      title={res.name}
                      value={res.value}
                      key={"guild-resistance-item-" + res.name}
                    />
                  );
                })}
            </Grid>
          </Grid>
        </Box>
      </Suspense>
    </SectionBox>
  );
}
