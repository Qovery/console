import { getJsonTargetKey } from './get-json-target-key'

describe('getJsonTargetKey', () => {
  it.each(['accounts.0.password', String.raw`database\.password`, String.raw`path\\name.value`])(
    'preserves the selector %s without interpreting escapes',
    (keyName) => {
      expect(getJsonTargetKey({ isJson: true, keyName })).toBe(keyName)
    }
  )

  it.each([undefined, '', '   '])(
    'rejects a missing or blank selector (%s) instead of importing the whole secret',
    (keyName) => {
      expect(() => getJsonTargetKey({ isJson: true, keyName })).toThrow('Please enter a JSON property path.')
    }
  )

  it('rejects JSON selection for a mounted file', () => {
    expect(() => getJsonTargetKey({ isJson: true, isFile: true, keyName: 'password' })).toThrow(
      'JSON selection is only supported for environment variables.'
    )
  })

  it.each([false, true])('leaves whole-secret and file requests without a selector (isFile=%s)', (isFile) => {
    expect(getJsonTargetKey({ isFile })).toBeNull()
  })
})
