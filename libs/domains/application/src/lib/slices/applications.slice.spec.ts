import { applications, applicationsAdapter } from './applications.slice'

describe('applications reducer', () => {
  it('should handle initial state', () => {
    const expected = applicationsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinEnvApplication: {},
      statusLoadingStatus: 'not loaded',
    })

    expect(applications(undefined, { type: '' })).toEqual(expected)
  })

  // it('should handle fetchApplications', () => {
  //   let state = applications(undefined, fetchApplications.pending(null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loading',
  //       error: null,
  //       entities: {},
  //       statusLoadingStatus: 'not loaded',
  //     })
  //   )
  //
  //   state = applications(state, fetchApplications.fulfilled([{ id: 1 }], null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loaded',
  //       error: null,
  //       entities: { 1: { id: 1 } },
  //       statusLoadingStatus: 'not loaded',
  //     })
  //   )
  //
  //   state = applications(state, fetchApplications.rejected(new Error('Uh oh'), null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'error',
  //       error: 'Uh oh',
  //       entities: { 1: { id: 1 } },
  //       statusLoadingStatus: 'not loaded',
  //     })
  //   )
  // })
})
