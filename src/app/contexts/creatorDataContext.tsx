import React, {Dispatch, PropsWithChildren, useContext, useEffect, useState} from 'react';
import {CreatorDataType} from "@/app/parserFactory";


export type CreatorDataContextType = {
    creatorData: CreatorDataType,
    setCreatorData: Dispatch<CreatorDataType>
    originalCreatorData: CreatorDataType,
    title: string
};

export const CreatorDataContext = React.createContext<CreatorDataContextType | null>(null)

export const CreatorDataContextProvider = (props: PropsWithChildren<{ creatorData: Promise<CreatorDataType> , title: any}>) =>{
    const ctx = useContext(CreatorDataContext)
    const [ready, setReady] = useState(false)

    const [title, setTitle ] = useState(props.title)
    const [creatorData, setCreatorData] = useState<CreatorDataType | null>(null)
    const [originalCreatorData, setOriginalCreatorData] = useState<CreatorDataType | null>(null)

    useEffect(() => {
        props?.creatorData?.then((data) => {
            setCreatorData(data)
            setOriginalCreatorData(data)
        })
    }, [])
    useEffect(() => {
        title.then((t: string) => {
            setTitle(t)
        })
    }, []);


    if (!creatorData) {
        return <>{props.children}</>
    }
    const values = {
        creatorData,
        setCreatorData,
        originalCreatorData,
        title
    }

    return (
        <CreatorDataContext.Provider value={{...ctx, ...values} as CreatorDataContextType}>
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