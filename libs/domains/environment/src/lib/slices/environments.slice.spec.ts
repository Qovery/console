import { environments, environmentsAdapter } from './environments.slice'

describe('environments reducer', () => {
  it('should handle initial state', () => {
    const expected = environmentsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      loadingEnvironmentStatus: 'not loaded',
      loadingEnvironmentDeployments: 'not loaded',
      loadingEnvironmentDeploymentRules: 'not loaded',
      error: null,
      joinProjectEnvironments: {},
    })

    expect(environments(undefined, { type: '' })).toEqual(expected)
  })
})
