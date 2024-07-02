import {FileObject} from "../page"
import {getFile} from "../fileService";
import {ParserProcess} from "../parserFactory";

export type GuildLevels = {
    name: string
    value: number
}

export default async function GuildsFileParser(data: FileObject): Promise<ParserProcess> {

    const guildLevels: GuildLevels[] = []

    function parseLine(line: string) {
        const split = line.split(" ")
        const name = split?.at(0)
        const value = parseInt(split?.at(1) || "0")
        if (name && value > 0) {
            return {name, value}
        }
    }

    return {
        key: 'guilds',
        run: async (): Promise<GuildLevels[]> => {
            const fileContent = await getFile(data.download_url)
            const lines = fileContent.split("\n")
            lines.forEach((line: string) => {
                const l = parseLine(line)
                if (l) {
                    guildLevels.push(l)
                }
            });

            return guildLevels
        }
    }

}
