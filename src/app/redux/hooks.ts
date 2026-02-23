import { useEffect } from "react";
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore,
} from "react-redux";
import { getData } from "../fileService";
import { doFilter } from "../filters/creatorDataFilters";
import { CreatorDataType } from "../parserFactory";
import { FullGuild, GuildUtils } from "../utils/guildUtils";
import {
  AppThunk,
  initAbilities,
  initializeGuilds,
  setAllGuilds,
  setCreatorData,
  setFilteredData,
  setInitialized,
  setReady,
} from "../redux/reincReducer"
import { AppDispatch, RootState } from "./reincStore";


// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: TypedUseSelectorHook<RootState> = () => useStore<RootState>();

export const useCreatorData = () =>
  useAppSelector(
    (state: RootState) => state.reducer.creatorDataState.creatorData,
  );

export const useCreatorDataContext = () =>
  useAppSelector((state: RootState) => state.reducer.creatorDataState);

export const useReinc = () => {
  const context = useAppSelector((state) => state.reducer.reincContext);
  return context;
};
export const useFilteredData = () => {
  const context = useAppSelector((state) => state.reducer.filteredData);
  return context;
};

export const useGuildUtils = () => {
  const creatorDataState = useCreatorData();
  const reinc = useReinc();
  return GuildUtils(creatorDataState, reinc);
};

export const initGuilds = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  const creatorData = state.reducer.creatorDataState.creatorData;
  const reinc = state.reducer.reincContext;

  if (!reinc.ready) return;

  const guildUtils = GuildUtils(creatorData, reinc);
  const guilds = guildUtils.getMainGuilds() as FullGuild[];

  dispatch(initializeGuilds(guilds));
};

export const useInitializer = () => {
  const dispatch = useAppDispatch();
  const creatorDataState = useCreatorDataContext();
  const initialized = creatorDataState.initialized;
  const allGuilds = useAppSelector(
    (state) => state.reducer.reincContext.allGuilds,
  );
  const filteredData = useAppSelector((state) => state.reducer.filteredData);
  const guilds = filteredData.guilds;

  const reinc = useReinc();

  useEffect(() => {
    if (
      initialized === false &&
      (!creatorDataState.creatorData?.guilds ||
        creatorDataState.creatorData.guilds.length === 0)
    ) {
      getData().then((creatorData) => {
        dispatch(setCreatorData({ value: creatorData as CreatorDataType }));
        console.debug(
          "Set creator data from file and initialized set to true.",
          creatorData,
        );
      });
    }
  }, [creatorDataState, dispatch, initialized]);

  useEffect(() => {
    if (
      creatorDataState?.creatorData?.guilds?.length > 0 &&
      allGuilds?.length === 0
    ) {
      const guildUtils = GuildUtils(creatorDataState.creatorData, reinc);
      const mainGuilds = guildUtils.getMainGuilds();
      if (mainGuilds.length > 0) {
        dispatch(setAllGuilds(mainGuilds as FullGuild[]));
      }
      console.debug("All guilds set in state.");
    }
  }, [creatorDataState, dispatch, allGuilds, guilds, reinc]);

  useEffect(() => {
    if (!initialized && allGuilds?.length > 0 && guilds.length === 0) {
      dispatch(initGuilds());
      console.debug("Guilds initialized.");
    }
  }, [creatorDataState, dispatch, initialized, allGuilds, guilds.length]);

  useEffect(() => {
    if (!initialized && guilds?.length === 0 && allGuilds?.length > 0) {
      const fd = doFilter(creatorDataState, reinc);
      console.debug("Filtered data on initialization", fd);
      if (fd?.guilds && fd.guilds.length > 0) {
        dispatch(setFilteredData(fd));
        console.debug("Reinc computed and initialized set to true.", reinc);
      }
    }
  }, [
    allGuilds?.length,
    creatorDataState,
    dispatch,
    filteredData,
    guilds?.length,
    initialized,
    reinc,
  ]);

  useEffect(() => {
    if (
      !initialized &&
      filteredData.guilds?.length > 0 &&
      reinc.allSkills?.ids.length === 0
    ) {
      dispatch(initAbilities());
      dispatch(setInitialized({ value: true }));
      dispatch(setReady({ value: true }));
      console.debug("Reinc computed and initialized set to true.", reinc);
    }
  }, [dispatch, filteredData.guilds?.length, initialized, reinc]);

  return { initialized };
};
