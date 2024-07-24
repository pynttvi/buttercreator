import {ReincAbility} from "@/app/contexts/reincContext";

export function sortByName<T>(array: { name: string }[]): T[] {
    return array.sort((a, b) => (a.name < b.name) ? -1 : 1) as T[]
}

export function sortByMaxAndName<T>(
    array: { name: string; max: number }[]
): T[] {
    return array.sort((a, b) => {
        if (a.name === b.name) {
            return b.max - a.max; // Sort by max in descending order if names are the same
        }
        return a.name.localeCompare(b.name); // Otherwise, s
    }) as T[];
}


export function onlyUniqueNameWithHighestMax(abilities: ReincAbility[]) {

    const newAbilities: ReincAbility[] = []

    abilities.forEach((ability: ReincAbility) => {
        const idx = newAbilities.findIndex(na => na.name == ability.name)
        if (idx !== -1) {
            const a = newAbilities.at(idx)
            if (a && a.max < ability.max) {
                newAbilities.splice(idx, 1)
                newAbilities.push(ability)
            }
        } else {
            newAbilities.push(ability)
        }
    })

    return newAbilities
}


export function sortById<T>(array: { id: number }[]): T[] {
    return array.sort((a, b) => (a.id < b.id) ? -1 : 1) as T[]
}

const ALPHABET = ['K', 'M', 'G', 'T']
const TRESHOLD = 1000

export const formatNumber = (n: number, fn?: (n: number, fn?: () => number) => number): string => {
    let idx = 0
    while (n >= TRESHOLD && ++idx <= ALPHABET.length) n /= TRESHOLD
    if (fn) n = fn(n)
    return String(idx === 0 ? n : n.toFixed(2) + ALPHABET[idx - 1])
}

export function onlyUnique(value: { name: string }, index: any, array: any[]) {
    return array.findIndex((v: { name: string }) => {
        return value.name === v.name
    }) === index;
}

export const roundUp5 = (n: number) => {
    return Math.ceil(n / 5) * 5;
}

export const roundDown5 = (n: number) => {
    return Math.floor(n / 5) * 5;
}

export function roundAbilityTrained(oldValue: number, newValue: number) {
    if (newValue > oldValue) {
        return roundUp5(newValue)
    } else {
        return roundDown5(newValue)
    }
}

export function capitalize(string?: string) {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1);
}


export function simplifyStat(statName: string) {
    const stat = statName.trim().toLowerCase().replaceAll("_", " ")
    if(stat.startsWith("spm")){
        return statName
    }
    if (stat === "sp") {
        return "spm"
    }
    if (stat === "hp") {
        return "hpm"
    }

    if (stat === "strength") {
        return "str"
    }
    if (stat === "constitution") {
        return "con"
    }
    if (stat === "dexterity") {
        return "dex"
    }
    if (stat === "intelligence") {
        return "int"
    }
    if (stat === "wisdom") {
        return "wis"
    }
    if (stat === "charisma") {
        return "cha"
    }

    if (stat === "sp regen") {
        return "spr"
    }
    if (stat == "spell points") {
        return "spm"
    }
    if (stat == "spell point regeneration") {
        return "spr"
    }
    if (stat == "hit point regeneration") {
        return "spr"
    }
    if (stat == "hp regen") {
        return "hpr"
    }

    if(stat.includes("res")){
        const split = stat.split(" ")
        if(split.length > 0){
            return `${split[0].substring(0,4)} res`.trim().toLowerCase()
        }
    }
    return stat
}
