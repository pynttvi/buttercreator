import React, {Dispatch, PropsWithChildren, useContext, useEffect, useState} from 'react';
import {doFilter} from "@/app/filters/creatorDataFilters";
import {CreatorDataType} from "@/app/parserFactory";
import {ReincType} from "@/app/contexts/reincContext";


export type CreatorDataContextType = {
    creatorData: CreatorDataType,
    setCreatorData: Dispatch<CreatorDataType>
};

export const CreatorDataContext = React.createContext<CreatorDataContextType | null>(null)

export const CreatorDataContextProvider = (props: PropsWithChildren<{ creatorData: Promise<CreatorDataType> }>) => {
    const ctx = useContext(CreatorDataContext)
    const [ready, setReady] = useState(false)
    const [creatorData, setCreatorData] = useState<CreatorDataType | null>(null)

    useEffect(() => {
        props.creatorData.then((data) => {
            setCreatorData(data)
        })
    }, [])


    if (!creatorData) {
        return <>{props.children}</>
    }
    const values = {
        creatorData,
        setCreatorData
    }

    return (
        <CreatorDataContext.Provider value={{...ctx, ...values}}>
            {props.children}
        </CreatorDataContext.Provider>
    )
}

export const useCreatorData = (): CreatorDataContextType => {
    const ctx = useContext(CreatorDataContext)
    if(!ctx){
        throw new Error("Creator data context error")
    }
    return ctx
}