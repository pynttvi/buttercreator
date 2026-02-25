"use client";
import { deepEqual, sortById } from "@/app/utils/utils";
import { Input, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderEditCellParams,
} from "@mui/x-data-grid";
import { GridApiCommunity } from "@mui/x-data-grid/internals";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { MAX_STAT, ReincStat } from "../redux/appContext";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updateStat } from "../redux/reincReducer";
import { useDebounceValue } from "../utils/debounce";
import SectionBox from "./sectionBox";

const TrainedInput = (props: {
  params: GridRenderEditCellParams<ReincStat>;
}) => {
  const dispatch = useAppDispatch();
  const max = MAX_STAT;
  const { row } = props.params;

  const [value, setValue] = useState(row.trained);

  const debouncedValue = useDebounceValue(value, 500);

  // update only when debounced value changes
  useEffect(() => {
    if (debouncedValue !== row.trained) {
      dispatch(
        updateStat({
          id: row.id,
          trained: debouncedValue,
        }),
      );
    }
  }, [debouncedValue, dispatch, row.id, row.trained]);

  const parse = (newValue: number) => {
    const next = Math.max(0, Math.min(newValue, max));
    setValue(next);
  };

  return (
    <Input
      value={value}
      type="number"
      className={`edit-stat${row.id} ${
        props.params.cellMode === "edit" ? "active-stat" : ""
      }`}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        parse(parseInt(e.target.value || "0"))
      }
    />
  );
};

export default function StatsList() {
  const dispatch = useAppDispatch();
  const apiRef = React.useRef<GridApiCommunity | undefined>();
  const [lastEdit, setLastEdit] = useState("");
  const stats = useAppSelector(
    (state) => state.reducer.reincContext.stats,
    deepEqual,
  );

  const selectionModel = stats.filter((s) => s.trained > 0).map((s) => s.id);

  // useEffect(() => {
  //   (async () => {
  //     await new Promise((resolve) => setTimeout(resolve, 50));
  //     const active: HTMLInputElement | null = document.querySelector(
  //       `.${lastEdit || "none"} .MuiInputBase-input`,
  //     );
  //     if (active) {
  //       active.focus();
  //       active.select();
  //     }
  //   })();
  // }, [lastEdit]);

  const defaultCellProps: Partial<GridColDef<ReincStat>> = {
    width: 75,
    editable: true,
    renderEditCell: (params) => {
      return <TrainedInput params={params} />;
    },
  };
  const columns: GridColDef<ReincStat>[] = [
    {
      field: "name",
      headerName: "Name",
    },
    {
      ...defaultCellProps,
      field: "trained",
      headerName: "trained",
      type: "number",
      sortable: true,
    },
  ];

  const checkBoxChanged = (params: GridCellParams) => {
    const { value, row, colDef } = params;
    console.debug("Checkbox changed", { value, row, colDef });

    setLastEdit(`edit-stat${params.row.id}`);

    if (value === false) {
      dispatch(updateStat({ ...params.row, trained: 1 }));
      apiRef?.current?.setEditCellValue({
        id: params.id,
        field: "trained",
        value: 10,
      });
    } else {
      dispatch(updateStat({ ...params.row, trained: 0 }));

      apiRef?.current?.setEditCellValue({
        id: params.id,
        field: "trained",
        value: 0,
      });
    }

    setTimeout(() => {
      apiRef?.current?.startCellEditMode({ id: row.id, field: "trained" });
      setLastEdit(`edit-stat${params.row.id}`);
    }, 100);
  };

  const processRowUpdate = useCallback((oldRow: any, newRow: any) => {
    console.debug("Processing row update", { oldRow, newRow });
    return newRow;
  }, []);

  return (
    <SectionBox id={"stats"}>
      <Suspense fallback="Loading...">
        <Box sx={{ height: 400 }}>
          <Typography
            variant="h4"
            textTransform={"capitalize"}
            marginBlock={"40px"}
          >
            Stats
          </Typography>
          {stats ? (
            <DataGrid
              sx={{ height: 400 }}
              rows={stats}
              columns={columns}
              initialState={{}}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectionModel}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={(error) => {
                console.error(error);
              }}
              onCellClick={(params: GridCellParams, event, details) => {
                if (params.field === "__check__") {
                  checkBoxChanged(params);
                }
              }}
              hideFooter={true}
              disableColumnSelector={true}
              // @ts-ignore
              apiRef={apiRef}
            />
          ) : (
            <></>
          )}
        </Box>
      </Suspense>
    </SectionBox>
  );
}
