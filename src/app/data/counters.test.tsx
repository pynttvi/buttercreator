import {expect, test, vi} from "vitest";
import {getFile} from "@/app/fileService";
import {ReincContextType} from "@/app/contexts/reincContext";
import {GuildUtils} from "@/app/utils/guildUtils";
import useCounters from "@/app/data/counters";
import {formatNumber} from "@/app/utils/utils";
import {mockCreatorData} from "../../../vitestSetup";

const getDataMock = vi.fn()

vi.mock("@/app/fileService", () => ({
    getFile: vi.fn(),
    getData: vi.fn()
}))

vi.mock("@/app/service/guildService", () => ({
    GuildService: vi.fn()
}))

const mockedGetFile = vi.mocked(getFile, true);
const mockedGuildService = vi.mocked(GuildUtils, true);


test('Counter tests', async () => {
    const override: Partial<ReincContextType> = {
        skills: [
            {name: "attack", cost: 1300, type: 'skill', trained: 100, id: 1, max: 100, maxed:true, enabled: true}
        ]
    }
    const {creatorDataContext, reinc} = await mockCreatorData(override);
    const cost = useCounters(reinc, creatorDataContext).countAbilitiesCost("skill")
    expect(formatNumber(cost.exp)).toEqual("52.74M")
    expect(formatNumber(cost.gold)).toEqual("23.44K")
})
