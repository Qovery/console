import { projects, projectsAdapter } from './projects.slice'

describe('projects reducer', () => {
  it('should handle initial state', () => {
    const expected = projectsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinOrganizationProject: {},
    })

    expect(projects(undefined, { type: '' })).toEqual(expected)
  })

  // it('should handle postProject', () => {
  //   let state = projects(undefined, postProject.pending(null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loading',
  //       error: null,
  //       entities: {},
  //     })
  //   )
  //
  //   state = projects(state, postProject.fulfilled({ id: 1 }, null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loaded',
  //       error: null,
  //       entities: { 1: { id: 1 } },
  //       ids: [1],
  //       joinOrganizationProject: {},
  //     })
  //   )
  //
  //   state = projects(state, postProject.rejected(new Error('Uh oh'), null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'error',
  //       error: 'Uh oh',
  //       entities: { 1: { id: 1 } },
  //     })
  //   )
  // })
})
