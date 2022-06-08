import { fetchDatabases, databasesAdapter, databases } from './databases.slice'

describe('databases reducer', () => {
  it('should handle initial state', () => {
    const expected = databasesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinEnvDatabase: {},
    })

    expect(databases(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchDatabases', () => {
    let state = databases(undefined, fetchDatabases.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = databases(state, fetchDatabases.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = databases(state, fetchDatabases.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
