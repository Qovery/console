import { fetchApplications, applicationsAdapter, applications } from './applications.slice'

describe('applications reducer', () => {
  it('should handle initial state', () => {
    const expected = applicationsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinEnvApplication: {},
    })

    expect(applications(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchApplications', () => {
    let state = applications(undefined, fetchApplications.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = applications(state, fetchApplications.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = applications(state, fetchApplications.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
