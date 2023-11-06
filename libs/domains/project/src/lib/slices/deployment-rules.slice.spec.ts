import { deploymentRulesAdapter, deploymentRulesReducer } from './deployment-rules.slice'

describe('deploymentRules reducer', () => {
  it('should handle initial state', () => {
    const expected = deploymentRulesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinProjectDeploymentRules: {},
    })

    expect(deploymentRulesReducer(undefined, { type: '' })).toEqual(expected)
  })

  // it('should handle fetchDeploymentRules', () => {
  //   let state = deploymentRulesReducer(undefined, fetchDeploymentRules.pending(null, null))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loading',
  //       error: null,
  //       entities: {},
  //     })
  //   )
  //
  //   state = deploymentRulesReducer(state, fetchDeploymentRules.fulfilled([{ id: 1 }], null, { projectId: '1' }))
  //
  //   expect(state).toEqual(
  //     expect.objectContaining({
  //       loadingStatus: 'loaded',
  //       error: null,
  //       entities: { 1: { id: 1 } },
  //       ids: [1],
  //     })
  //   )
  //
  //   state = deploymentRulesReducer(state, fetchDeploymentRules.rejected(new Error('Uh oh'), null, null))
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
