export function sortByName<T>(array: { name: string }[]): T[] {
    return array.sort((a, b) => (a.name < b.name) ? -1 : 1) as T[]
}
export function sortById<T>(array: { id: number }[]): T[] {
    return array.sort((a, b) => (a.id < b.id) ? -1 : 1) as T[]
}