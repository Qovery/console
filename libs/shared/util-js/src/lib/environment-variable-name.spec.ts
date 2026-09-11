import { ENVIRONMENT_VARIABLE_NAME_PATTERN } from './environment-variable-name'

describe('ENVIRONMENT_VARIABLE_NAME_PATTERN', () => {
  it.each(['API_KEY', '_PRIVATE_KEY', 'VALUE2'])('accepts %s', (name) => {
    expect(ENVIRONMENT_VARIABLE_NAME_PATTERN.test(name)).toBe(true)
  })

  it.each(['2VALUE', 'API KEY', 'API-KEY', ''])('rejects %s', (name) => {
    expect(ENVIRONMENT_VARIABLE_NAME_PATTERN.test(name)).toBe(false)
  })
})
