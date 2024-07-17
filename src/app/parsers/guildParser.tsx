import {FileObject} from "../page"
import {ParserProcess} from "../parserFactory"
import {getFile} from "../fileService"
import {GuildLevels} from "@/app/parsers/guildsFileParser";

export type GuildAbility = {
    name: string,
    max: number,
    type: 'skill' | 'spell'
}

export type GuildStat = {
    name: string,
    value: number
}
export type GuildLevel = { stats: GuildStat[], abilities: GuildAbility[] }
export type Guild = {
    name: string
    levelMap: Map<string, GuildLevel>,
    subGuildLevels: GuildLevels[]
}

export default async function GuildParser(data: FileObject): Promise<ParserProcess> {

    const guildLevels = new Map<string, GuildLevel>()

    let level = "1"
    let subguildsMatched = false

    const lineStartRow: RegExp = /\|\s*(\d{1,2})\s*\|/g
    const statDataMatcher: RegExp = /(\|\s*([a-zA-z].*)\|)/gm
    const abilityLevelMatcher = /Level (\d{1,2}) abilities:/
    const abilityMatcher = /May (study|train) (spell|skill) (.+) to (\d{1,3})%/
    const subguildsMatcher = /Subguilds:/
    const subguilds: GuildLevels[] = []

    async function parseLine(line: string) {
        if (subguildsMatched) {
            const sglMatch = line.match(/([a-zA-z_]+)\s*(\d{1,2})/)
            if (sglMatch) {
                const name = sglMatch?.at(1)?.toLowerCase()
                const value = sglMatch?.at(2)?.toLowerCase()
                if (name && value) {
                    subguilds.push({name, levels: parseInt(value)} as GuildLevels)
                }
                return
            }
        }
        const levelMatch = line.match(lineStartRow)?.at(0)?.replaceAll("|", "")?.trim()?.toLowerCase()

        if (levelMatch) {
            level = levelMatch
            guildLevels.set(level, {stats: [], abilities: []})
        }

        const statText = line.match(statDataMatcher)?.at(0)?.replaceAll("|", "")?.trim()?.toLowerCase()
        if (statText) {
            statText.split(",")?.forEach((stat) => {
                const statName = stat.split("(")?.at(0)
                const statValue = stat.split("(")?.at(1)?.replaceAll(")", "")
                if (statName && statValue) {
                    guildLevels.get(level)?.stats?.push({name: statName.trim(), value: parseInt(statValue)})
                }
            })
            return
        }

        const abilityLevel = line.match(abilityLevelMatcher)?.at(1)
        if (abilityLevel) {
            level = abilityLevel
            return
        }

        const abilityMatch = line.match(abilityMatcher)

        if (abilityMatch) {
            const type = abilityMatch?.at(2)?.trim() === 'skill' ? 'skill' : 'spell'
            const name = abilityMatch?.at(3)?.trim()?.toLowerCase()
            const max = abilityMatch?.at(4)?.trim() || "0"
            if (name && type && max) {
                guildLevels.get(level)?.abilities.push({name, type, max: parseInt(max)})
                return
            }
        }
        if (line.match(subguildsMatcher)) {
            subguildsMatched = true
        }

    }


    async function parseData(data: FileObject): Promise<Guild> {
        const fileContent = await getFile(data.download_url)
        subguildsMatched = false
        const lines = fileContent.split("\n")
        lines.forEach((line: string) => {
            parseLine(line)
        });

        return {
            name: data.name.replaceAll(".chr", "").toLowerCase().replaceAll("_", " ")
            , levelMap: guildLevels,
            subGuildLevels: subguilds
        }

    }

    return {
        // @ts-ignore
        key: "guild_" + data.name.replaceAll(".chr", ""),
        run: async (): Promise<Guild> => {
            return parseData(data)
        }
    }
}
