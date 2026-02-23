"use client";
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridRowParams,
  GridRowSelectionModel,
  MuiEvent,
} from "@mui/x-data-grid";
import React, { Suspense, useCallback, useState } from "react";
import { Race } from "../parsers/raceParser";
import { useAppDispatch, useCreatorData, useReinc } from "../redux/hooks";
import { setDrawerOpen, setHelpText, setRace } from "../redux/reincReducer";
import SectionBox from "./sectionBox";

const defaultCellProps: Partial<GridColDef<Race>> = {
  width: 75,
};
const columns: GridColDef<Race>[] = [
  {
    field: "name",
    headerName: "Name",
  },
  {
    ...defaultCellProps,
    field: "str",
    headerName: "str",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "dex",
    headerName: "dex",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "con",
    headerName: "con",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "int",
    headerName: "int",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "wis",
    headerName: "wis",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "cha",
    headerName: "cha",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "size",
    headerName: "size",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "exp",
    headerName: "exp",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "spr",
    headerName: "spr",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "hpr",
    headerName: "hpr",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "skill_max",
    headerName: "skmax",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "spell_max",
    headerName: "spmax",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "skill_cost",
    headerName: "skcost",
    type: "number",
    sortable: true,
  },
  {
    ...defaultCellProps,
    field: "spell_cost",
    headerName: "spcost",
    type: "number",
    sortable: true,
  },
];

export default function RaceList() {
  const dispatch = useAppDispatch();

  const creatorData = useCreatorData();

  const [races, setRaces] = useState<Race[]>(creatorData.races);

  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>();
  
  const changeSelectionMode = useCallback(
    (
      rowSelectionModel: GridRowSelectionModel,
      details: GridCallbackDetails,
    ) => {
      const race: Race | null = details.api.getRow(rowSelectionModel[0]) || null;
      dispatch(setRace(race));
      console.debug("SETTING RACE", race);
      setSelectionModel(rowSelectionModel);
    },
    [dispatch]
  );

  const showRaceHelp = useCallback(
    (
      params: GridRowParams,
      event: MuiEvent<React.MouseEvent>,
      details: GridCallbackDetails,
    ) => {
      const raceName = params.row.name;
      const raceHelp = creatorData.helpRace.find(
        (hr: { name: any }) => hr.name === raceName,
      );
      dispatch(setHelpText(raceHelp?.text || ""));
      dispatch(setDrawerOpen(true));
    },
    [dispatch, creatorData.helpRace],
  );

  return (
    <SectionBox id={"races"} title="Races">
      <Suspense fallback="Loading...">
        {creatorData?.races ? (
          <DataGrid
            sx={{ height: 400 }}
            rows={races}
            columns={columns}
            initialState={{}}
            checkboxSelection
            disableRowSelectionOnClick
            disableMultipleRowSelection
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={changeSelectionMode}
            onRowClick={showRaceHelp}
            hideFooter={true}
            columnHeaderHeight={80}
          />
        ) : (
          <></>
        )}
      </Suspense>
    </SectionBox>
  );
}
