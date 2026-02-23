import React, {
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { CreatorDataType } from "@/app/parserFactory";

export type CreatorDataContextType = {
  creatorData: CreatorDataType;
  originalCreatorData: CreatorDataType;
};

export const CreatorDataContextProvider = (
  props: PropsWithChildren<{ creatorData: CreatorDataType }>,
) => {
  const CreatorDataContext = React.createContext<CreatorDataContextType>({
    creatorData: props.creatorData,
    originalCreatorData: { ...props.creatorData },
  });

  const ctx = useContext(CreatorDataContext);
  const [ready, setReady] = useState(false);

  const values = {
    creatorData: props.creatorData,
    originalCreatorData: { ...props.creatorData },
  };

  return (
    <CreatorDataContext.Provider
      value={{ ...ctx, ...values } as CreatorDataContextType}
    >
      {props.children}
    </CreatorDataContext.Provider>
  );
};
