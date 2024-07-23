import {FileObject} from "../page"
import {getFile} from "../fileService";
import {ParserProcess} from "../parserFactory";
import {FullGuild} from "@/app/utils/guildUtils";

export type Ability = {
    id: number
    name: string
    cost: number
    trained: number
    maxed: boolean
    type: "skill" | "spell"
    guild?: FullGuild
    enabled: boolean
}

export default async function

    AblitiyCostsParser(data: FileObject, abilityType: 'skills' | 'spells'): Promise<ParserProcess> {

    const ablitiyCosts: Ability[] = []

    function parseLine(line: string) {
        const split = line.split(":")
        const name = split?.at(0)
        const cost = parseInt(split?.at(1) || "0")
        if (name) {
            return {name, cost}
        }
    }

    return {
        key: abilityType,
        run: async (): Promise<Ability[]> => {
            const fileContent = await getFile(data.download_url)
            const lines = fileContent.split("\n")
            lines.forEach((line: string, i: number) => {
                const l = parseLine(line)
                if (l) {
                    ablitiyCosts.push({
                        id: i,
                        trained: 0,
                        type: abilityType === "skills" ? "skill" : "spell",
                        maxed: false,
                        enabled: false,
                        ...l
                    })
                }
            });

            return ablitiyCosts
        }
    }

}
