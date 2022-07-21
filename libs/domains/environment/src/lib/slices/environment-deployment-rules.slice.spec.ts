import {
  fetchEnvironmentDeploymentRules,
  environmentDeploymentRulesAdapter,
  environmentDeploymentRulesReducer,
} from './environment-deployment-rules.slice'

describe('environmentDeploymentRules reducer', () => {
  it('should handle initial state', () => {
    const expected = environmentDeploymentRulesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    })

    expect(environmentDeploymentRulesReducer(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchEnvironmentDeploymentRuless', () => {
    let state = environmentDeploymentRulesReducer(undefined, fetchEnvironmentDeploymentRules.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    )

    state = environmentDeploymentRulesReducer(state, fetchEnvironmentDeploymentRules.fulfilled([{ id: 1 }], null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    )

    state = environmentDeploymentRulesReducer(
      state,
      fetchEnvironmentDeploymentRules.rejected(new Error('Uh oh'), null, null)
    )

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    )
  })
})
