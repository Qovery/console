import { getServiceVariableScope } from './service-variables-utils'

describe('getServiceVariableScope', () => {
  it('should return the agentic workflow variable scope', () => {
    expect(getServiceVariableScope('AGENTIC_WORKFLOW')).toBe('AGENTIC_WORKFLOW')
  })
})
