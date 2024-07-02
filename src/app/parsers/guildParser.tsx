import {FileObject} from "../page"
import {ParserProcess} from "../parserFactory"
import {getFile} from "../fileService"

export type GuildLevels = { stats: object[], abilities: object[], subguilds: object[] }
export type Guild = {
    name: string
    levels: Map<string, GuildLevels>
}

export default async function GuildParser(data: FileObject): Promise<ParserProcess> {

    const guildLevels = new Map<string, GuildLevels>()

    let level = "1"
    let subguildsMatched = false

    const lineStartRow: RegExp = /\|\s*(\d{1,2})\s*\|/g
    const statDataMatcher: RegExp = /(\|\s*([a-zA-z].*)\|)/gm
    const abilityLevelMatcher = /Level (\d{1,2}) abilities:/
    const abilityMatcher = /May (study|train) (spell|skill) (.+) to (\d{1,3})%/
    const subguildsMatcher = /Subguilds:/

    async function parseLine(line: string) {

        if (subguildsMatched) {
            const sglMatch = line.match(/([a-zA-z_]+)\s*(\d{1,2})/)
            if (sglMatch) {
                const name = sglMatch?.at(1)?.toLowerCase()
                const value = sglMatch?.at(2)?.toLowerCase()
                if (name && value) {
                    guildLevels.get(level)?.subguilds?.push({name, value})
                }
                return
            }
        }
        const levelMatch = line.match(lineStartRow)?.at(0)?.replaceAll("|", "")?.trim()?.toLowerCase()

        if (levelMatch) {
            level = levelMatch
            guildLevels.set(level, {stats: [], abilities: [], subguilds: []})
        }

        const statText = line.match(statDataMatcher)?.at(0)?.replaceAll("|", "")?.trim()?.toLowerCase()
        if (statText) {
            statText.split(",")?.forEach((stat) => {
                const statName = stat.split("(")?.at(0)
                const statValue = stat.split("(")?.at(1)?.replaceAll(")", "")
                if (statName && statValue) {
                    guildLevels.get(level)?.stats?.push({name: statName, value: statValue})
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
            const type = abilityMatch?.at(2)?.trim()
            const name = abilityMatch?.at(3)?.trim()?.toLowerCase()
            const max = abilityMatch?.at(4)?.trim()
            if (name && type && max) {
                guildLevels.get(level)?.abilities.push({name, type, max})
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

        return {name: data.name, levels: guildLevels}

    }

    return {
        key: "guild_" + data.name,
        run: async (): Promise<Guild> => {
            return parseData(data)
        }
    }
}
