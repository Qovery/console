import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { changeScopeForAll } from './change-scope-all'

describe('changeScopeForAll()', () => {
  it('should set the scope for each provided key', () => {
    const setValue = jest.fn()
    const keys = ['key', 'another_key', false, true]

    changeScopeForAll(APIVariableScopeEnum.APPLICATION, setValue, keys)

    expect(setValue.mock.calls).toEqual([
      ['key_scope', APIVariableScopeEnum.APPLICATION.toString()],
      ['another_key_scope', APIVariableScopeEnum.APPLICATION.toString()],
      ['false_scope', APIVariableScopeEnum.APPLICATION.toString()],
      ['true_scope', APIVariableScopeEnum.APPLICATION.toString()],
    ])
  })
})
