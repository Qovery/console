import { parseEnvText } from './parse-dotenv'

const envText = `
QOVERY_BUILD_TIME=hello
variable_denv=hey
`

describe('parseEnvText', function () {
  it('should parse env text', function () {
    const env = parseEnvText(envText)
    expect(env).toEqual({
      QOVERY_BUILD_TIME: 'hello',
      variable_denv: 'hey',
    })
  })
  it('should parse env text with double equal sign', function () {
    const env = parseEnvText(`
QOVERY_BUILD_TIME=hello=world
variable_denv=hey
`)
    expect(env).toEqual({
      QOVERY_BUILD_TIME: 'hello=world',
      variable_denv: 'hey',
    })
  })
})
