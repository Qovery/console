import { triggerToggleAll } from './trigger-toggle-all'

describe('triggerToggleAll()', () => {
  it('should set the secret flag for each provided key', () => {
    const setValue = jest.fn()
    const keys = ['key', 'another_key']

    triggerToggleAll(true, setValue, keys)

    expect(setValue.mock.calls).toEqual([
      ['key_secret', true],
      ['another_key_secret', true],
    ])
  })
})
