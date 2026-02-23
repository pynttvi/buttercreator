"use client";

import CopyToClipboardButton from "@/app/components/copyToClipboard";
import SectionBox from "@/app/components/sectionBox";
import guildDirections from "@/app/data/guildDirections.json";
import { BackhgroundColor } from "@/app/theme";
import { FullGuild } from "@/app/utils/guildUtils";
import { entityToArray, onlyUniqueNameWithHighestMax } from "@/app/utils/utils";
import { Alert, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import { nanoid } from "nanoid";
import { PropsWithChildren, Suspense, useMemo } from "react";
import { ReincAbility } from "../redux/appContext";
import { useAppSelector } from "../redux/hooks";

type GuildDirection = {
  name: string;
  to: string;
  back: string;
  infoTo?: string;
  infoBack?: string;
};

const getTrainingText = (a: ReincAbility, separator: string) => {
  const count = a.trained / 5;
  let text = "";

  if (count <= 20) {
    text += `${count} ${a.type === "skill" ? "train" : " study"} ${a.name}${separator}`;
  } else {
    text += `${20} ${a.type === "skill" ? "train" : " study"} ${a.name}${separator}`;
    text += `${count - 20} ${a.type === "skill" ? "train" : " study"} ${a.name}${separator}`;
  }
  return text;
};

function DirBox(props: { title: string; dirs: string; info?: string }) {
  const copyPasteSeparator = useAppSelector((state) => state.reducer.reincContext.copyPasteSeparator);
  const info = props.info;
  const dirs = props.dirs.replaceAll(";", copyPasteSeparator);
  return (
    <>
      {dirs && dirs !== "" && (
        <Box>
          <Typography variant={"subtitle1"}>{props.title}</Typography>
          {info && info !== "" && (
            <Alert sx={{ backgroundColor: BackhgroundColor }} severity="info">
              {info}
            </Alert>
          )}
          <Stack direction={"row"} sx={{ alignItems: "center" }}>
            <Typography variant={"caption"}>{props.dirs}</Typography>
            <CopyToClipboardButton copyText={dirs}></CopyToClipboardButton>
          </Stack>
        </Box>
      )}
    </>
  );
}

const GuildItem = (
  props: PropsWithChildren<{
    guild: FullGuild;
    trainedAbilities: ReincAbility[];
  }>,
) => {
  const { guild, trainedAbilities } = props;
  let mainTrainingText = "";
  const copyPasteSeparator = useAppSelector((state) => state.reducer.reincContext.copyPasteSeparator);

  const dirs: GuildDirection[] = guildDirections as GuildDirection[];
  const dirGuild = dirs.find((d) => d.name === guild.name);
  const toGuild = dirGuild?.to || "";
  const backGuild = dirGuild?.back || "";
  const infoTo = dirGuild?.infoTo;
  const infoBack = dirGuild?.infoBack;
  return (
    <>
      <Typography
        key={"training-name-item-" + guild.name + nanoid(4)}
        variant={"h5"}
        style={{ textTransform: "capitalize", marginBottom: "20px" }}
      >
        {guild.name}
      </Typography>
      <Stack direction={"column"} spacing={2}>
        <DirBox title={"Dirs"} dirs={toGuild} info={infoTo} />
        <DirBox title={"Back"} dirs={backGuild} info={infoBack} />

        <Box>
          <Typography variant={"body1"}>Training</Typography>
          <Stack direction={"row"} sx={{ alignItems: "center" }}>
            <Box>
              {trainedAbilities
                .filter((a) => a.guild?.name === guild.name)
                .map((a) => {
                  const trainingText = getTrainingText(
                    a,
                    copyPasteSeparator,
                  );
                  mainTrainingText += trainingText;
                  return (
                    <Typography
                      variant={"caption"}
                      key={"training-ability-item-" + a.name + nanoid(4)}
                    >
                      {trainingText}
                    </Typography>
                  );
                })}
              {trainedAbilities.filter((a) => a.guild?.name === guild.name)
                .length === 0 && (
                <Typography variant={"caption"}>
                  No skills or spells trained
                </Typography>
              )}
            </Box>
            <CopyToClipboardButton
              copyText={mainTrainingText}
            ></CopyToClipboardButton>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

function TrainingItem(props: { guild: FullGuild }) {
  const level = useAppSelector((state) => state.reducer.reincContext.level);
  const skills = entityToArray(useAppSelector((state) => state.reducer.reincContext.skills));
  const spells = entityToArray(useAppSelector((state) => state.reducer.reincContext.spells));
  const guild: FullGuild = props.guild;

  const trainedAbilities = useMemo(() => {
    return onlyUniqueNameWithHighestMax(
      skills
        .concat(spells)
        .filter((s) => s.trained > 0 && s.enabled),
    );
  }, [skills, spells]);

  if (level === 0) {
    return <></>;
  }
  return (
    <>
      {guild.subGuilds
        .filter((sg) => sg.trained > 0)
        .map((g) => {
          return (
            <Stack
              direction={"row"}
              key={"training-item-" + g.name + nanoid(4)}
            >
              <Grid direction={"row"} xs={6} sm={6} md={6}>
                <GuildItem guild={g} trainedAbilities={trainedAbilities} />
              </Grid>
            </Stack>
          );
        })}
      {guild.trained > 0 && (
        <Grid
          direction={"row"}
          xs={6}
          sm={6}
          md={6}
          key={"training-item-" + guild.name + nanoid(4)}
        >
          <GuildItem guild={guild} trainedAbilities={trainedAbilities} />
        </Grid>
      )}
    </>
  );
}

export default function Training() {
  const guilds = useAppSelector((state) => state.reducer.reincContext.guilds);

  return (
    <SectionBox id={"training"}>
      <Suspense fallback="Loading...">
        <Typography
          variant="h4"
          textTransform={"capitalize"}
          marginBlock={"40px"}
        >
          Training
        </Typography>
        <Box sx={{ height: 400 }}>
          {guilds &&
            guilds.map((g) => {
              return <TrainingItem key={"tr-it-" + g.name} guild={g} />;
            })}
        </Box>
      </Suspense>
    </SectionBox>
  );
}
