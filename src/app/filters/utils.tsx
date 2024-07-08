export function sortByName<T>(array: { name: string }[]): T[] {
    return array.sort((a, b) => (a.name < b.name) ? -1 : 1) as T[]
}