export function sortByKey<T extends { name?: string }>(array: T[], key: keyof T = 'name'): T[] {
  return array.sort((a, b) => {
    if (!a.name || !b.name) return 0

    const x = (a[key] as string).toLowerCase()
    const y = (b[key] as string).toLowerCase()

    return x < y ? -1 : x > y ? 1 : 0
  })
}
