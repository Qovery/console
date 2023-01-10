import { Dictionary } from '@reduxjs/toolkit'
import { addOneToManyRelation, getEntitiesByIds, removeOneToManyRelation } from './one-to-many-redux-helpers'

describe('add a one-to-many relation to a collection', () => {
  let relations: Record<string, string[]> = {}
  let parentId = 'parentId'
  let childId = 'childId'

  beforeEach(() => {
    relations = {}
    parentId = 'parentId'
    childId = 'childId'
  })

  it('should add a first relation to a parent', () => {
    relations = addOneToManyRelation(parentId, childId, relations)
    expect(relations).toEqual({
      parentId: ['childId'],
    })
  })

  it('should add a second relation to a parent that already has one', () => {
    relations = addOneToManyRelation(parentId, childId, relations)
    relations = addOneToManyRelation(parentId, 'child2Id', relations)

    expect(relations).toEqual({
      parentId: ['childId', 'child2Id'],
    })
  })

  it('should not add the same child twice', () => {
    relations = addOneToManyRelation(parentId, childId, relations)
    relations = addOneToManyRelation(parentId, childId, relations)

    expect(relations).toEqual({
      parentId: ['childId'],
    })
  })

  it('should do nothing if parentId is empty', () => {
    relations = addOneToManyRelation(parentId, childId, relations)

    relations = addOneToManyRelation(undefined, childId, relations)

    expect(relations).toEqual({
      parentId: ['childId'],
    })
  })

  it('should do nothing if childId is empty', () => {
    relations = addOneToManyRelation(parentId, childId, relations)

    relations = addOneToManyRelation(parentId, undefined, relations)

    expect(relations).toEqual({
      parentId: ['childId'],
    })
  })
})

describe('remove a one-to-many relation', () => {
  let relations: Record<string, string[]> = {}
  let parentId = 'parentId'
  let childId = 'childId'

  beforeEach(() => {
    relations = {
      [parentId]: [childId],
    }
    parentId = 'parentId'
    childId = 'childId'
  })

  it('should remove a child from relation', () => {
    relations = removeOneToManyRelation(childId, relations)
    expect(relations).toEqual({
      parentId: [],
    })
  })

  it('should remove a child from all relations', () => {
    relations = { ...relations, parent2: [childId] }
    relations = removeOneToManyRelation(childId, relations)
    expect(relations).toEqual({
      parentId: [],
      parent2: [],
    })
  })
})

describe('retrieving entities from the store from list of ids', () => {
  const relations: Record<string, string[]> = {
    parent1: ['child1', 'child2'],
    parent2: ['child1', 'child3'],
  }
  const entities: Dictionary<{ name: string }> = {
    child1: { name: 'child1' },
  }

  it('should find the child that is listed in the relations of the first parent', () => {
    const ids = relations['parent1']

    const entitiesFound = getEntitiesByIds(entities, ids)
    expect(entitiesFound).toEqual([{ name: 'child1' }])
  })
})
