'use client'
import ParserFactory, {CreatorDataType} from "./parserFactory";

export async function getFile(url: string) {

    console.debug("Getting data", url)

    const res = await fetch(url, {cache: "force-cache"})

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.text()
}

export async function getGuildFile(url: string) {

    const res = await fetch(url)

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.text()
}

export async function getData(): Promise<Partial<CreatorDataType>> {

    let myData: Partial<CreatorDataType> = {};
    const res = await fetch('https://api.github.com/repos/juuussi/zCreator_data/contents/data?ref=master', {cache: "force-cache"});

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const factory = ParserFactory();
    const json = await res.json();

    async function readFiles() {
        for (const f of await json) {
            // if ((important && NON_GUILD_FILES.includes((f.name))) || (!important && !NON_GUILD_FILES.includes((f.name)))) {
            const process = await factory.createProcessForFile(f);
            const dataField = {key: process.key, data: await process.run()};
            // @ts-ignore
            myData[dataField.key] = dataField.data
            //}
        }
    }

    await readFiles()
    // readFiles(lessImportantFiles)

    return myData;
}

