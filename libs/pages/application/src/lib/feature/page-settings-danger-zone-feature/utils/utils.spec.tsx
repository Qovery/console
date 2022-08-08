import { UseFormRegister, UseFormUnregister } from 'react-hook-form/dist/types/form'
import { onAddStorage, onRemove } from './utils'

describe('onAddStorage', () => {
  it('should add a new row', () => {
    const register: UseFormRegister<{ [key: string]: string | number }> = jest.fn()
    let keys: string[] = []
    keys = onAddStorage(register, keys)
    expect(register).toHaveBeenCalledTimes(3)
    expect(keys).toHaveLength(1)
  })
})

describe('onRemove', () => {
  it('should remove a row and a key', () => {
    const unregister: UseFormUnregister<{ [key: string]: string | number }> = jest.fn()
    let keys: string[] = ['123', '456']
    keys = onRemove('123', unregister, keys)
    expect(unregister).toHaveBeenCalledTimes(3)
    expect(keys).toHaveLength(1)
  })
})
