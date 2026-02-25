"use client";
import {
  entityToArray,
  roundDown5,
  roundUp5,
  sortByName,
} from "@/app/utils/utils";
import { Input, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridCallbackDetails,
  GridCellParams,
  GridColDef,
  GridRenderEditCellParams,
  GridRowSelectionModel,
  GridValueGetter,
} from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ReincAbility } from "../redux/appContext";
import {
  useAppDispatch,
  useAppSelector,
  useCreatorData,
  useFilteredData
} from "../redux/hooks";
import {
  removeAbility,
  setDrawerOpen,
  setHelpText,
  updateAbility,
} from "../redux/reincReducer";

import SectionBox from "./sectionBox";

function TrainedInput(props: {
  params: GridRenderEditCellParams<ReincAbility>;
  abilityType: "skills" | "spells";
}) {
  const dispatch = useAppDispatch();

  const skillMax = useAppSelector(
    (state) => state.reducer.reincContext.skillMax,
  );
  const spellMax = useAppSelector(
    (state) => state.reducer.reincContext.spellMax,
  );

  const abilityList = useAppSelector((state) =>
    props.abilityType === "skills"
      ? state.reducer.reincContext.skills
      : state.reducer.reincContext.spells,
  );

  const row = props.params.row;
  const abi = abilityList.entities[row.id] || row;

  const max =
    props.abilityType === "skills"
      ? Math.min(skillMax, abi.max)
      : Math.min(spellMax, abi.max);

  const [value, setValue] = useState<number>(abi.trained || max);

  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const dispatchUpdate = useCallback(
    (trained: number) => {
      console.debug("Updating custom value", trained);

      dispatch(
        updateAbility({
          type: props.abilityType,
          ability: { ...abi, trained },
        }),
      );
    },
    [dispatch, props.abilityType, abi],
  );

  const parse = (newValue: number) => {
    let next = Math.min(Math.max(newValue, 0), max);

    if (next !== value) {
      if (next > 10) {
        next = next > value ? roundUp5(next) : roundDown5(next);
      }
      setValue(next);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        dispatchUpdate(next);
      }, 500);
    }
  };

  return (
    <Input
      value={value}
      type="number"
      className={`edit-ability${props.params.row.id} ${
        props.params.cellMode === "edit" ? "active-ability" : ""
      }`}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        parse(parseInt(e.target.value || "0"));
      }}
    />
  );
}

export default function AbilityList(props: { type: "skills" | "spells" }) {
  const creatorData = useCreatorData();
  const filteredData = useFilteredData();
  const dispatch = useAppDispatch();
  const abilityType = props.type;

  const skills = useAppSelector((state) => state.reducer.reincContext.skills);
  const spells = useAppSelector((state) => state.reducer.reincContext.spells);
  const skillMax = useAppSelector(
    (state) => state.reducer.reincContext.skillMax,
  );
  const spellMax = useAppSelector(
    (state) => state.reducer.reincContext.spellMax,
  );
  const race = useAppSelector((state) => state.reducer.reincContext.race);

  const customSkillMaxBonus = useAppSelector(
    (state) => state.reducer.reincContext.customSkillMaxBonus,
  );
  const customSpellMaxBonus = useAppSelector(
    (state) => state.reducer.reincContext.customSpellMaxBonus,
  );

  const abilities = useMemo(() => {
    console.debug("Filtered data", filteredData.skills);
    const base =
      props.type === "skills" ? filteredData.skills : filteredData.spells;

    const reincArray =
      props.type === "skills" ? entityToArray(skills) : entityToArray(spells);

    const reincMap = new Map(reincArray.map((a) => [a.name, a]));
    // console.debug("Mapping abilities", reincMap);

    return sortByName<ReincAbility>(
      base.map((ability) => {
        const reincAbility = reincMap.get(ability.name);
        return reincAbility || ability;
      }),
    )
  }, [props.type, filteredData.skills, filteredData.spells, skills, spells]);

  const selectionModel = abilities
    .filter((a) => a.trained > 0)
    .map((a) => a.id);

  const update = useCallback(
    (reincAbility: ReincAbility | ReincAbility[]) => {
      dispatch(updateAbility({ type: props.type, ability: reincAbility }));
    },
    [dispatch, props.type],
  );

  const getMax = useCallback(
    (max: number) => {
      if (props.type === "skills") {
        if (skillMax - max >= 0) {
          max =
            customSkillMaxBonus + Math.min(max - (100 - skillMax), skillMax);
        } else {
          max = customSkillMaxBonus + Math.min(max, race?.skill_max || 100);
        }
      }

      if (props.type === "spells") {
        if (spellMax - max >= 0) {
          max =
            customSpellMaxBonus + Math.min(max - (100 - spellMax), spellMax);
        } else {
          max = customSpellMaxBonus + Math.min(max, race?.spell_max || 100);
        }
      }
      return max;
    },
    [
      props.type,
      skillMax,
      customSkillMaxBonus,
      race?.skill_max,
      spellMax,
      customSpellMaxBonus,
      race?.spell_max,
    ],
  );

  const apiRef = React.useRef<GridApiCommunity | undefined>();
  const [lastEdit, setLastEdit] = useState("");

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const active: HTMLInputElement | null = document.querySelector(
        `.${lastEdit || "none"} .MuiInputBase-input`,
      );
      if (active) {
        active.focus();
        active.select();
      }
    })();
  }, [lastEdit]);

  const changeSelectionMode = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails,
  ) => {
    if (rowSelectionModel.length === 0) {
      const entities = props.type === "skills" ? skills : spells;

      const updates = entityToArray(entities).map((a) => ({
        ...a,
        id: a.id,
        trained: 0,
      }));

      dispatch(removeAbility({ type: props.type, ability: updates }));
    }

    if (rowSelectionModel.length >= 0) {
      if (apiRef.current?.getRowsCount() === rowSelectionModel.length) {
        const model = [...rowSelectionModel];
        const rows: ReincAbility[] = [];
        model.map((id) => {
          const r = apiRef.current?.getRow(id);
          rows.push(r);
        });

        rows.forEach((r) => {
          update({ ...r, trained: getMax(r.max) });
        });
      }
    }
  };

  const checkBoxChanged = (params: GridCellParams) => {
    const { value, row, colDef } = params;
    let max = getMax(row.max);
    if (value === false) {
      if (apiRef && apiRef.current) {
        apiRef.current.setEditCellValue({
          id: row.id,
          field: "trained",
          value: max,
        });
      }
      update({ ...row, trained: max });
      if (apiRef && apiRef.current) {
        //     apiRef.current.startCellEditMode({id: row.id, field: 'trained'})
      }
    } else {
      dispatch(
        removeAbility({ type: props.type, ability: { ...row, trained: 0 } }),
      );
    }
  };

  const dataColumns: GridColDef<ReincAbility>[] = useMemo(
    () => [
      { field: "name", headerName: "Name", filterable: true, width: 200 },
      {
        field: "trained",
        headerName: "trained",
        type: "number",
        width: 100,
        sortable: true,
        editable: true,
        align: "right",
        renderEditCell: (params) => {
          return <TrainedInput params={params} abilityType={props.type} />;
        },
        cellClassName: (params) => {
          if (params.cellMode === "edit") {
            return `edit-ability${params.row.id} active-ability`;
          } else {
            return `edit-ability${params.row.id}`;
          }
        },
      },
      {
        field: "max",
        headerName: "max",
        filterable: true,
        editable: false,
        width: 100,
        valueGetter: (params: GridValueGetter<ReincAbility>) => {
          let max: number = params as unknown as number;
          max = getMax(max);
          return max;
        },
      },
    ],
    [getMax, props.type],
  );

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 100,
      },
      ...dataColumns,
    ],
    [dataColumns],
  );

  const processRowUpdate = useCallback((oldRow: any, newRow: any) => {
    if (newRow.trained > 0 && newRow.trained < 10) {
      newRow.trained = 5;
    }
    return newRow;
  }, []);

  const showAbilityHelp = useCallback(
    (ability: ReincAbility) => {
      const abilityName = ability.name.toLowerCase();
      const abilityHelpList =
        abilityType === "skills"
          ? creatorData.helpSkills
          : creatorData.helpSpells;

      const abilityHelp = abilityHelpList.find((ah) => ah.name === abilityName);
      let text = abilityHelp?.text || "";
      if (text === "") {
        text = "No help found";
      }
      console.debug("No help found", abilityName);
      dispatch(setHelpText(text));
      dispatch(setDrawerOpen(true));
    },
    [abilityType, creatorData, dispatch],
  );

  return (
    <SectionBox id={props.type}>
      <Suspense fallback="Loading...">
        {abilities && (
          <Box sx={{ height: 400 }}>
            <Typography
              variant="h4"
              textTransform={"capitalize"}
              marginBlock={"40px"}
            >
              {props.type}
            </Typography>

            <DataGrid
              rows={abilities}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              hideFooter={true}
              disableColumnSelector
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={(error) => {
                console.error(error);
              }}
              onCellClick={(params: GridCellParams, event, details) => {
                if (params.field === "__check__") {
                  checkBoxChanged(params);
                }
                if (params.field === "name") {
                  showAbilityHelp(params.row);
                }
              }}
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={changeSelectionMode}
              // @ts-ignore
              apiRef={apiRef}
            />
          </Box>
        )}
      </Suspense>
    </SectionBox>
  );
}
