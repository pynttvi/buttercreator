import {FileObject} from "../page"
import {getFile} from "../fileService";
import {ParserProcess} from "../parserFactory";


export const baseStats: BaseStatName[] = [
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "cha",
]

export type DamageTypeName = "asph" | "acid" | "cold" | "fire" | "elec" | "magi" | "pois" | "psio" | "phys"
export type ResistanceTypeName =
    "asph res"
    | "acid res"
    | "cold res"
    | "fire res"
    | "elec res"
    | "magi res"
    | "pois res"
    | "psio res"
    | "phys res"

export const damageTypes: DamageTypeName[] = [
    "asph", "acid", "cold", "fire", "elec", "magi", "pois", "psio", "phys"
]

export const resistanceNames: ResistanceTypeName[] = [
    "asph res", "acid res", "cold res", "fire res", "elec res", "magi res", "pois res", "psio res", "phys res"
]
export const stats = [
    "name",
    ...baseStats,
    "size",
    "exp",
    "spr",
    "hpr",
    "skill_max",
    "spell_max",
    "skill_cost",
    "spell_cost",
]

export type BaseStatName = "str" | "dex" | "con" | "int" | "wis" | "cha"

export type BaseStats = {
    str: number,
    dex: number,
    con: number,
    int: number,
    wis: number,
    cha: number,
}

export type Resistances = {
    [key in keyof ResistanceTypeName]: number;
};

export type ExtraStats = {
    size: number,
    exp: number,
    spr: number,
    hpr: number,
    skill_max: number,
    spell_max: number,
    skill_cost: number,
    spell_cost: number,
}
export type Race = {
    id: number
    name: string
} & BaseStats & ExtraStats

export default async function RacesFileParser(data: FileObject): Promise<ParserProcess> {

    const races: Race[] = []

    function parseLine(line: string): Race | undefined {
        const raceMap = new Map<string, number | string>()
        const split = line.split(":")
        stats.forEach((stat, i) => {
            if (i === 0) {
                const value: string = split?.at(i)?.trim() || ""
                raceMap.set(stat, value)
            } else {
                const value: string = split?.at(i)?.trim() || "0"
                raceMap.set(stat, parseInt(value))
            }
        })
        const name = split?.at(0)
        const value = parseInt(split?.at(1) || "0")
        if (name && value > 0) {
            return Object.fromEntries(raceMap.entries()) as Race
        }
    }

    return {
        key: 'races',
        run: async (): Promise<Race[]> => {
            const fileContent = await getFile(data.download_url)
            const lines = fileContent.split("\n").filter((line: string) => !line.startsWith("#"))

            lines.forEach((line: string, i: number) => {
                const l = parseLine(line)
                if (l) {
                    races.push({...l, id: i,})
                }
            });
            return races
        }
    }

}
