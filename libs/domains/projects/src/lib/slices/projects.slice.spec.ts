import { postProjects, projects, projectsAdapter } from './projects.slice'

describe('projects reducer', () => {
  it('should handle initial state', () => {
    const expected = projectsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(projects(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle postProjects', () => {
    let state = projects(undefined, postProjects.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = projects(state, postProjects.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = projects(state, postProjects.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
