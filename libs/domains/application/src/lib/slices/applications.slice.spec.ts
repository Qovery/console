import { applications, applicationsAdapter } from './applications.slice'

describe('applications reducer', () => {
  it('should handle initial state', () => {
    const expected = applicationsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinEnvApplication: {},
      statusLoadingStatus: 'not loaded',
      defaultApplicationAdvancedSettings: {
        loadingStatus: 'not loaded',
        settings: undefined,
      },
    })

    expect(applications(undefined, { type: '' })).toEqual(expected)
  })
})
