import { Dictionary } from '@reduxjs/toolkit'

export const addOneToManyRelation = (
  parentId: string | undefined,
  childId: string | undefined,
  relations: Record<string, string[]>
): Record<string, string[]> => {
  if (!parentId || !childId) return relations

  if (!relations[parentId]) relations[parentId] = [childId]
  else if (relations[parentId].indexOf(childId) === -1) relations[parentId].push(childId)

  return relations
}

export function getEntitiesByIds<T>(fullCollection: Dictionary<T>, ids: string[]): T[] {
  const collectionByParentId: T[] = []

  if (ids && ids.length) {
    ids.forEach((id) => {
      if (fullCollection[id]) collectionByParentId.push(fullCollection[id] as T)
    })
  }

  return collectionByParentId
}

export const removeOneToManyRelation = (
  childId: string,
  relations: Record<string, string[]>
): Record<string, string[]> => {
  // we look for the child id in all the parents' children and we remove it
  for (const key in relations) {
    const indexOfChild = relations[key].indexOf(childId)
    if (indexOfChild !== -1) relations[key].splice(indexOfChild, 1)
  }

  return relations
}
