import { application, fetchApplication, initialApplicationState } from './application.slice'

describe('application reducer', () => {
  it('should handle initial state', () => {
    const expected = {
      loadingStatus: 'not loaded',
      error: null,
      application: {
        id: '',
        created_at: '',
      },
    }

    expect(initialApplicationState).toEqual(expected)
  })

  it('should handle fetchApplications', () => {
    let state = application(undefined, fetchApplication.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
      })
    )

    state = application(state, fetchApplication.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
      })
    )

    state = application(state, fetchApplication.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
      })
    )
  })
})
