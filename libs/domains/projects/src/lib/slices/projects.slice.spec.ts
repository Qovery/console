import { fetchProjects, projectsAdapter, projectsReducer } from './projects.slice'

describe('projects reducer', () => {
  it('should handle initial state', () => {
    const expected = projectsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(projectsReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchProjectss', () => {
    let state = projectsReducer(undefined, fetchProjects.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = projectsReducer(state, fetchProjects.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = projectsReducer(state, fetchProjects.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
