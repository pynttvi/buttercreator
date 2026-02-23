"use client";
import HelpGuild from "@/app/components/helpGuild";
import NumberInputBasic from "@/app/components/numberInput";
import { guildMeetsRequirements } from "@/app/data/guildRequirements";
import { FullGuild, MAX_GUILD_LEVELS } from "@/app/utils/guildUtils";
import { sortByName } from "@/app/utils/utils";
import { Divider, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import { GridDeleteIcon } from "@mui/x-data-grid";
import { PropsWithChildren, useCallback } from "react";
import {
  useAppDispatch,
  useAppSelector,
  useGuildUtils
} from "../redux/hooks";
import {
  addOrUpdateGuild,
  MAX_LEVEL,
  setDrawerOpen,
  setHelpText
} from "../redux/reincReducer";
import LoadingFallback from "./loadingFallback";
import SectionBox from "./sectionBox";

const Item = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: "left",
}));

const DeleteGuildIcon = styled(Divider)(({ theme }) => ({
  alignItems: "center",
}));

export type GuildType = "main" | "sub";

function GuildItem(props: { guild: FullGuild; isSubguild: boolean }) {
  const dispatch = useAppDispatch();
  const guild = props.guild;

  const guildUtils = useGuildUtils();
  const trainedForGuild = guildUtils.trainedLevelForGuild(guild);

  const level = useAppSelector((state) => state.reducer.reincContext.level);

  const trained = guild ? guild.trained : 0;
  const freeLevels = useAppSelector(
    (state) => state.reducer.reincContext.freeLevels,
  );
  const race = useAppSelector((state) => state.reducer.reincContext.race);

  const showGuildHelp = useCallback(() => {
    dispatch(setHelpText(<HelpGuild guild={guild} />));
    dispatch(setDrawerOpen(true));
  }, [dispatch, guild]);

  const addOrUpdate = useCallback(
    (g: { guildType: GuildType; guild: FullGuild; trained: number }) => {
      dispatch(addOrUpdateGuild(g));
      // console.debug("Added or updated guild", reinc);
    },
    [dispatch],
  );

  const onClick = () => {
    console.debug("Trained for guild", guild, level);

    if (trained === 0) {
      addOrUpdate({
        guildType: guild.guildType,
        guild: guild,
        trained:
          Math.min(
            guild.levels,
            MAX_GUILD_LEVELS - trainedForGuild,
            MAX_LEVEL - level,
          ) || 0,
      });
    }
    focusClass(className);
  };

  const disabled =
    trainedForGuild >= MAX_GUILD_LEVELS ||
    level >= MAX_LEVEL ||
    (guild.guildType === "sub" && trainedForGuild < 45) ||
    !guildMeetsRequirements(
      guild,
      guildUtils.getReincGuildsFlat(),
      level - freeLevels,
      race,
    );

  const className = `guild-${guild.name} ${disabled ? "disabled" : ""}`;

  const onChange = (value: number | null) => {
    const newValue = Math.min(value || 0, guild.levels);
    addOrUpdate({
      guildType: guild.guildType,
      guild: guild,
      trained: newValue,
    });
  };

  function deleteGuild(guild: FullGuild): void {
    let value: number;
    if (disabled || (level === MAX_LEVEL && guild.guildType === "sub")) {
      value = 1;
      addOrUpdate({
        guildType: guild.guildType,
        guild: guild,
        trained: value,
      });

      //  focusClass(className)
    } else {
      value = 0;
      addOrUpdate({
        guildType: guild.guildType,
        guild: guild,
        trained: value,
      });
    }
  }

  const onDelete = () => {
    deleteGuild(guild);
  };

  const focusClass = (className: string) => {
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const active: HTMLInputElement | null = document.querySelector(
        `.${className || "none"} .base-NumberInput-input`,
      );
      if (active) {
        active?.focus();
        active?.select();
      }
    })();
  };

  if (!guild) {
    return null;
  }

  return (
    <>
      <Grid direction={"row"} xs={12} sm={6} md={4} key={"index-" + guild.name}>
        <Box sx={{ minWidth: "400px" }}>
          <Item>
            {/*// @ts-ignore*/}
            <Stack
              direction={"row"}
              xs={12}
              sm={6}
              md={4}
              sx={{ alignItems: "center" }}
              key={"index-stack" + guild.name}
            >
              <Typography
                variant={"subtitle1"}
                onClick={showGuildHelp}
                sx={{
                  width: "70%",
                  textTransform: "capitalize",
                  ...(props.isSubguild ? { paddingLeft: "20px" } : {}),
                }}
              >
                {guild.name.replaceAll("_", " ")}
              </Typography>
              <Box
                sx={{
                  width: "50px",
                  height: "30px",
                  marginLeft: "15px",
                  alignItems: "center",
                }}
              >
                <NumberInputBasic
                  aria-label="guild levels input"
                  placeholder="0"
                  onChange={(_event: any, value1: number | null) =>
                    onChange(value1)
                  }
                  className={className}
                  value={guild.trained || 0}
                  onClick={onClick}
                  key={"guild-input" + guild.name}
                  disabled={disabled}
                />
              </Box>
              <DeleteGuildIcon>
                {guild.trained > 0 && (
                  <GridDeleteIcon
                    key={"delete-button-" + guild.name}
                    sx={{ marginLeft: "10px" }}
                    onClick={onDelete}
                  />
                )}
              </DeleteGuildIcon>
            </Stack>
          </Item>
        </Box>
      </Grid>
      {sortByName<FullGuild>(guild.subGuilds)?.map((sg) => {
        return (
          <GuildItem
            guild={sg}
            key={"guild-item-" + sg.name}
            isSubguild={true}
          />
        );
      })}
    </>
  );
}

export default function Guilds(props: PropsWithChildren<{}>) {
  const filteredGuilds = useAppSelector(
    (state) => state.reducer.filteredData.guilds,
  );
  const level = useAppSelector((state) => state.reducer.reincContext.level);
  const guilds = useAppSelector((state) => state.reducer.reincContext.guilds);

  const tryFindReincGuild = useCallback(
    (immutableGuild: FullGuild) => {
      if (level === 0) return immutableGuild;

      return (
        guilds.find(
          (g) => g.name.toLowerCase() === immutableGuild.name.toLowerCase(),
        ) || immutableGuild
      );
    },
    [guilds, level],
  );

  if (!filteredGuilds) {
    return <LoadingFallback />;
  }

  return (
    <SectionBox id={"guilds"} title="Guilds">
      <Grid
        container
        direction={"row"}
        gap={4}
        spacing={1}
        columns={{ xs: 4, sm: 6, md: 12 }}
      >
        {[...[...filteredGuilds]?.sort((a, b) => b.levels - a.levels)].map(
          (g: FullGuild) => {
            return (
              <Box key={"guild-item-" + g.name} sx={{ minWidth: "400px" }}>
                <GuildItem
                  guild={tryFindReincGuild(g as FullGuild)}
                  isSubguild={false}
                />
              </Box>
            );
          },
        )}
      </Grid>
    </SectionBox>
  );
}
