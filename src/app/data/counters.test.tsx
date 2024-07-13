import {expect, test, vi} from "vitest";
import * as fs from "node:fs";
import ParserFactory, {CreatorDataType} from "@/app/parserFactory";
import {getData, getFile} from "@/app/fileService";
import {defaultReincContext, ReincContextType} from "@/app/contexts/reincContext";
import {GuildService, GuildServiceType} from "@/app/service/guildService";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import Counters from "@/app/data/counters";
import {formatNumber} from "@/app/filters/utils";

const getDataMock = vi.fn()

vi.mock("@/app/fileService", () => ({
    getFile: vi.fn(),
    getData: vi.fn()
}))

vi.mock("@/app/service/guildService", () => ({
    GuildService: vi.fn()
}))

const mockedGetFile = vi.mocked(getFile, true);
const mockedGuildService = vi.mocked(GuildService, true);

async function mockCreatorData(overrideReinc?: Partial<ReincContextType>) {
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
    const reinc: ReincContextType = {
        addOrUpdateGuild: vi.fn(),
        getAbility: vi.fn(),
        getReincGuildByName: vi.fn(),
        guildService: mockedGuildService as unknown as GuildServiceType,
        setAllGuilds: vi.fn(),
        setBonusBaseStats: vi.fn(),
        setFilteredData: vi.fn(),
        setRace: vi.fn(),
        setSkillMax: vi.fn(),
        setSkills: vi.fn(),
        setSpellMax: vi.fn(),
        setSpells: vi.fn(),
        setStats: vi.fn(),
        setWishes: vi.fn(),
        updateAbility: vi.fn(),
        ...defaultReincContext,
        ...overrideReinc
    }
    const creatorDataContext: CreatorDataContextType = {
        creatorData: myData as CreatorDataType,
        originalCreatorData: myData as CreatorDataType,
        setCreatorData: vi.fn()
    }

    return {myData, reinc, creatorDataContext};
}

test('Counter tests', async () => {
    const override: Partial<ReincContextType> = {
        skills: [
            {name: "attack", cost: 1300, type: 'skill', trained: 100, id: 1, max: 100}
        ]
    }
    const {creatorDataContext, reinc} = await mockCreatorData(override);
    const cost = Counters(reinc, creatorDataContext).countAbilitiesCost("skill")
    expect(formatNumber(cost.exp)).toEqual("52.74M")
    expect(formatNumber(cost.gold)).toEqual("23.44K")
})
