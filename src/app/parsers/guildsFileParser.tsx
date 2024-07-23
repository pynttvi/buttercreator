import {FileObject} from "../page"
import {getFile} from "../fileService";
import {ParserProcess} from "../parserFactory";

export type GuildLevels = {
    name: string
    levels: number
}

export default async function GuildsFileParser(data: FileObject): Promise<ParserProcess> {

    const guildLevels: GuildLevels[] = []

    function parseLine(line: string) {
        const split = line.split(" ")
        const name = split?.at(0)?.replaceAll("_", " ")?.toLowerCase()
        const levels = parseInt(split?.at(1) || "0")
        if (name && levels > 0) {
            return {name, levels}
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
