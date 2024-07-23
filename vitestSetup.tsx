// vitestSetup.ts
import {vi} from "vitest";
import * as fs from "node:fs";
import ParserFactory, {CreatorDataType} from "@/app/parserFactory";
import {getFile} from "@/app/fileService";
import {ReincContext, ReincContextProvider, ReincContextType} from "@/app/contexts/reincContext";
import {
    CreatorDataContext,
    CreatorDataContextProvider,
    CreatorDataContextType
} from "@/app/contexts/creatorDataContext";
import {GuildUtils} from "@/app/utils/guildUtils";
import React, {PropsWithChildren} from "react";
import {render, waitFor} from "@testing-library/react";
import {Buttercreator} from "@/app/components/mainContent";
import {LoggingConfig} from "@/app/config/loggingConfig";

const getDataMock = vi.fn()

vi.mock("@/app/fileService", () => ({
    getFile: vi.fn(),
    getData: vi.fn()
}))

vi.mock("next/font/google", () => ({

    Space_Mono: vi.fn(() => ({
        style: {
            weight: ['400', '700']
        },
        subsets: ['latin'],
        display: 'swap',
    }))
}))


const mockedGetFile = vi.mocked(getFile, true);
const mockedGuildService = vi.mocked(GuildUtils, true);

export const renderWrapper = (reinc: ReincContextType | null, creatorDataContext: CreatorDataContextType) => {
    const component = render(
        <Buttercreator />,
        {
            wrapper: (props) => {
                return (
                    <CreatorDataContext.Provider value={creatorDataContext}>
                        <ReincContextProvider creatorDataContext={creatorDataContext}>
                            <ReincContext.Consumer>
                                {value => {
                                    reinc = value
                                    return <>props.children</>
                                }}
                            </ReincContext.Consumer>
                        </ReincContextProvider>
                    </CreatorDataContext.Provider>
                )
            }
        })

    return {
        reinc, component
    }
}

export async function mockCreatorData(overrideReinc?: Partial<ReincContextType>) {
    const folder = fs.readdirSync("./zCreator_data/data");
    const fileObjects = folder.map((f) => ({
        name: f,
        download_url: "/zCreator_data/data"
    }))
    const factory = ParserFactory();
    let myData: Partial<CreatorDataType> = {};
    for await (const f of await fileObjects) {
        const myPromise: Promise<string> = new Promise((resolve, reject) => {
            return resolve(fs.readFileSync('./zCreator_data/data/' + f.name).toString())
        });

        mockedGetFile.mockReturnValueOnce(myPromise)

        const process = await factory.createProcessForFile(f);
        const dataField = {key: process.key, data: await process.run()};
        // @ts-ignore
        myData[dataField.key] = dataField.data
    }

    const creatorDataContext: CreatorDataContextType = {
        creatorData: myData as CreatorDataType,
        originalCreatorData: myData as CreatorDataType,
        setCreatorData: vi.fn()
    }

    let reinc: ReincContextType | null = null

    let wrapper: any = null
    let component: any = null

    await waitFor(() => {
        wrapper = renderWrapper(reinc, creatorDataContext)
        component = wrapper.component
        reinc = wrapper.reinc
    })

    if (!reinc) {
        throw new Error("Test setup error")
    }

    reinc = reinc as ReincContextType
    return {myData, reinc, component, creatorDataContext};

}