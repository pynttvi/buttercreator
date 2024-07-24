import React, {Dispatch, PropsWithChildren, useContext, useEffect, useState} from 'react';
import {CreatorDataType} from "@/app/parserFactory";


export type CreatorDataContextType = {
    creatorData: CreatorDataType,
    setCreatorData: Dispatch<CreatorDataType>
    originalCreatorData: CreatorDataType,
};

export const CreatorDataContext = React.createContext<CreatorDataContextType | null>(null)

export const CreatorDataContextProvider = (props: PropsWithChildren<{ creatorData: CreatorDataType }>) => {
    const ctx = useContext(CreatorDataContext)
    const [ready, setReady] = useState(false)

    const [creatorData, setCreatorData] = useState<CreatorDataType>(props.creatorData)
    const [originalCreatorData, setOriginalCreatorData] = useState<CreatorDataType>(props.creatorData)

    if (!creatorData) {
        return <>{props.children}</>
    }
    const values = {
        creatorData,
        setCreatorData,
        originalCreatorData,
    }

    return (
        <CreatorDataContext.Provider value={{...ctx, ...values} as CreatorDataContextType}>
            {props.children}
        </CreatorDataContext.Provider>
    )
}

export const useCreatorData = (): CreatorDataContextType => {
    const ctx = useContext(CreatorDataContext)
    if (!ctx) {
        throw new Error("Creator data context error")
    }
    return ctx
}