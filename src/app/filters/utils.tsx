import {ReincAbility} from "@/app/contexts/reincContext";
import {useEffect, useState} from "react";

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
    if(!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const useCheckMobileScreen = (): {isMobileScreen: boolean, width: number} => {
    const [width, setWidth] = useState<number>(window.innerWidth);
    const handleWindowSizeChange = () => {
        setWidth(window.innerWidth);
    }

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    return {
        isMobileScreen: (width <= 1280),
        width: width
    };

}

export default useCheckMobileScreen

