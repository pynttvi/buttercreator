export function sortByName<T>(array: { name: string }[]): T[] {
    return array.sort((a, b) => (a.name < b.name) ? -1 : 1) as T[]
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
