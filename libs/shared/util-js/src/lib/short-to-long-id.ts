export const shortToLongId = (id: string, listIds: string[]): string => {
  if (id[0] !== 'z') return id
  id = id.slice(1)

  return listIds.find((theId) => theId.indexOf(id) >= 0) || id
}
