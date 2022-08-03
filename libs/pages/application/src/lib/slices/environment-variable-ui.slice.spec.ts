import { EnvironmentVariableUi, initialEnvironmentVariableUiState } from '@console/pages/application'

describe('environmentVariableUi reducer', () => {
  it('should handle initial state', () => {
    const expected: EnvironmentVariableUi = {
      showAll: false,
    }

    expect(initialEnvironmentVariableUiState).toEqual(expected)
  })
})
