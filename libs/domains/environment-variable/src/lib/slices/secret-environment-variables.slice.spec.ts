import { ServiceTypeEnum } from '@qovery/shared/enums'
import { mockSecretEnvironmentVariable } from '@qovery/shared/factories'
import {
  fetchSecretEnvironmentVariables,
  secretEnvironmentVariables,
  secretEnvironmentVariablesAdapter,
} from './secret-environment-variables.slice'

describe('secretEnvironmentVariables reducer', () => {
  it('should handle initial state', () => {
    const expected = secretEnvironmentVariablesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinApplicationSecretEnvironmentVariable: {},
    })

    expect(secretEnvironmentVariables(undefined, { type: '' })).toEqual(expected)
  })

  it('should handle fetchSecretEnvironmentVariables', () => {
    let state = secretEnvironmentVariables(undefined, fetchSecretEnvironmentVariables.pending(null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
        joinApplicationSecretEnvironmentVariable: {},
      })
    )

    const applicationId = '123'
    const secretEnv = mockSecretEnvironmentVariable(false, false)
    const serviceType = ServiceTypeEnum.APPLICATION

    state = secretEnvironmentVariables(
      state,
      fetchSecretEnvironmentVariables.fulfilled([secretEnv], null, { applicationId, serviceType })
    )

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        joinApplicationSecretEnvironmentVariable: {
          [applicationId]: [secretEnv.id],
        },
      })
    )

    expect(state.entities[secretEnv.id]).toStrictEqual(secretEnv)

    state = secretEnvironmentVariables(state, fetchSecretEnvironmentVariables.rejected(new Error('Uh oh'), null, null))

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
      })
    )
  })
})
