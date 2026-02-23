"use client";
import { GuildLevel } from "@/app/parsers/guildParser";
import { BaseStatName, BaseStats, Resistances } from "@/app/parsers/raceParser";
import { FullGuild } from "@/app/utils/guildUtils";
import { capitalize } from "@/app/utils/utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { PropsWithChildren, useMemo } from "react";
import { useAppSelector } from "../redux/hooks";

type Stats = {
  id: number;
} & BaseStats &
  Resistances;

export default function HelpGuild(
  props: PropsWithChildren<{ guild: FullGuild }>,
) {
  const helpText = useAppSelector(
    (state) => state.reducer.reincContext.helpText,
  );
  const { guildStats, statKey, resKeys } = useMemo(() => {
    const guildStats: Stats[] = [];
    const statKey: string[] = [];
    const statKeyIgnores = ["id"];

    for (let i = 1; i < props.guild.levels + 1; i++) {
      const statMap = new Map<string, any>();
      const guildLevels = props.guild.levelMap[i.toString()];
      statMap.set("id", i);
      guildLevels?.stats.forEach((st) => {
        let n = st.name.trim();
        if (n === "sp_regen") n = "spr";
        if (n === "hp_regen") n = "hpr";
        if (n.includes("resistance")) n = n.substring(0, 3) + " res";
        statMap.set(n, st.value);
      });
      guildStats.push(Object.fromEntries(statMap.entries()) as Stats);
    }

    guildStats.forEach((gs) => {
      Object.entries(gs)
        .filter(([_, v]) => v > 0)
        .forEach(([k]) => {
          const name = k.toLowerCase() as BaseStatName;
          if (
            !statKey.includes(name) &&
            !statKeyIgnores.includes(name) &&
            !name.includes("res")
          ) {
            statKey.push(name);
          }
        });
    });

    const resKeys: string[] = [];
    guildStats.forEach((gs) => {
      Object.entries(gs)
        .filter(([_, v]) => v > 0)
        .forEach(([k]) => {
          const name = k.toLowerCase();
          if (!resKeys.includes(name) && name.includes("res")) {
            resKeys.push(name);
          }
        });
    });

    return { guildStats, statKey, resKeys };
  }, [helpText]);

  const defaultCellProps: Partial<GridColDef> = {
    width: 75,
    editable: false,
  };

  const statCols: GridColDef[] = [
    { ...defaultCellProps, field: "id", headerName: "Level" },
    ...statKey.map((gs) => ({
      ...defaultCellProps,
      field: gs,
      headerName: capitalize(gs),
    })),
  ];

  const resCols: GridColDef[] = [
    { ...defaultCellProps, field: "id", headerName: "Level" },
    ...resKeys.map((rk) => ({
      ...defaultCellProps,
      field: rk,
      headerName: capitalize(rk),
    })),
  ];

  const LevelAbilitiesGrid = (
    props: PropsWithChildren<{ level: GuildLevel; idx: string | number }>,
  ) => {
    const { level, idx } = props;
    const cols: GridColDef[] = [
      { width: 300, editable: false, field: "name", headerName: "Name" },
      {
        width: 75,
        editable: false,
        ...defaultCellProps,
        field: "max",
        headerName: "Max",
      },
    ];
    const rows = Object.values(level.abilities)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a, index) => ({ id: index, ...a }));

    return (
      <div
        style={{ height: "400px", display: "flex", flexDirection: "column" }}
        key={`abilities-grid-${idx}`}
      >
        <DataGrid
          sx={{ flexGrow: 1 }}
          rows={rows}
          columns={cols}
          initialState={{}}
          disableRowSelectionOnClick
          disableColumnSelector
          hideFooterSelectedRowCount
          hideFooter
          rowSelection={false}
          columnHeaderHeight={80}
        />
      </div>
    );
  };

  const GuildAbilities = (props: PropsWithChildren<{ guild: FullGuild }>) => {
    const elements: React.ReactNode[] = [];
    Object.values(props.guild.levelMap).forEach((level, idx) => {
      elements.push(
        <Accordion key={`accordion-level-${idx}`}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${idx}-content`}
            id={`panel-${idx}-header`}
          >
            <Typography>Level {idx}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LevelAbilitiesGrid level={level} idx={idx} />
          </AccordionDetails>
        </Accordion>,
      );
    });
    return elements;
  };
  return (
    <>
      <Typography variant="h3" sx={{ textTransform: "capitalize" }}>
        {props.guild.name}
      </Typography>

      <Accordion key="accordion-stats">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="stats-content"
          id="stats-header"
        >
          <Typography variant="h5">Stats</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div
            style={{
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
            key="stats-grid"
          >
            <DataGrid
              sx={{ flexGrow: 1 }}
              rows={guildStats}
              columns={statCols}
              initialState={{}}
              disableRowSelectionOnClick
              disableColumnSelector
              hideFooterSelectedRowCount
              hideFooter
              rowSelection={false}
              columnHeaderHeight={80}
            />
          </div>
          <Typography variant="subtitle1">Total:</Typography>
          <Typography variant="body1">
            {statKey.map((sk) =>
              !sk.includes("res")
                ? `${sk}: ${guildStats.map((gs) => gs[sk as keyof Resistances] || 0).reduce((a, b) => a + b, 0)} `
                : null,
            )}
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion key="accordion-resistances">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="resistances-content"
          id="resistances-header"
        >
          <Typography variant="h5">Resistances</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div
            style={{
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
            key="resistances-grid"
          >
            <DataGrid
              sx={{ flexGrow: 1 }}
              rows={guildStats}
              columns={resCols}
              initialState={{}}
              disableRowSelectionOnClick
              disableColumnSelector
              hideFooterSelectedRowCount
              hideFooter
              rowSelection={false}
              columnHeaderHeight={80}
            />
          </div>
          <Typography variant="subtitle1">Total:</Typography>
          <Typography variant="body1">
            {resKeys.map(
              (rk) =>
                `${rk}: ${guildStats.map((gs) => gs[rk as keyof Resistances] || 0).reduce((a, b) => a + b, 0)} `,
            )}
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion key="accordion-abilities">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="abilities-content"
          id="abilities-header"
        >
          <Typography variant="h5">Abilities by Level</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <GuildAbilities guild={props.guild} />
        </AccordionDetails>
      </Accordion>
    </>
  );
}
