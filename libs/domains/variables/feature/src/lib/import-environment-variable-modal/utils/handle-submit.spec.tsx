import { formatData } from './handle-submit'

describe('formatData()', () => {
  it('should format the data correctly', () => {
    const data = {
      key_key: 'key',
      key_value: 'value\r',
      key_scope: 'application',
      key_secret: 'false',
      key2_key: 'key',
      key2_value: 'value',
      key2_scope: 'built_in',
      key2_secret: 'true',
    }
    const keys = ['key', 'key2']
    const result = formatData(data, keys)
    expect(result).toEqual([
      {
        name: 'key',
        value: 'value',
        scope: 'application',
        is_secret: false,
      },
      {
        name: 'key',
        value: 'value',
        scope: 'built_in',
        is_secret: true,
      },
    ])
  })
})
