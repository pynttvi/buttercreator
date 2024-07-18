import {FileObject} from "../page"
import {getFile} from "../fileService";
import {ParserProcess} from "../parserFactory";

export type SkillHelp = {
    name: string
    text: string
}

export const cleanName = (name: string) => {
    let n = name
    if (n.match(/.+(\.)$/g)) {
        n = n.substring(0, n.length - 1,)
    }
    n = n.toLowerCase()
    return n
}
export default async function HelpSkillsParser(data: FileObject): Promise<ParserProcess> {

    const skillHelps: SkillHelp[] = []
    let skill: string = ""
    let text: string = ""

    function parseLine(line: string) {
        if (line.includes("Help on skill:")) {
            if (skill !== "") {
                skillHelps.push({name: cleanName(skill), text: text})
            }
            skill = line.split("Help on skill:")?.at(1)?.trim() || ""
            text = ""
        }

        if (line.includes("------------------")) {
            return
        }

        if (skill !== "") {
            text += "\n" + line
        }

    }

    return {
        key: 'helpSkills',
        run: async (): Promise<SkillHelp[]> => {
            const fileContent = await getFile(data.download_url)
            const lines = fileContent.split("\n")
            lines.forEach((line: string) => {
                parseLine(line)
            });

            return skillHelps
        }
    }

}
