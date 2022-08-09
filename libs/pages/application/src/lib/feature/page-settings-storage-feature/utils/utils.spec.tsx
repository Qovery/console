import { UseFormRegister, UseFormUnregister } from 'react-hook-form/dist/types/form'
import { addStorage, initStorage, onRemove } from './utils'
import { applicationFactoryMock } from '@console/domains/application'

describe('onAddStorage', () => {
  it('should add a new row', () => {
    const register: UseFormRegister<{ [key: string]: string | number }> = jest.fn()
    let keys: string[] = []
    keys = addStorage(register, keys)
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

describe('initStorage', () => {
  it('should initialize the form', () => {
    const register: UseFormRegister<{ [key: string]: string | number }> = jest.fn()
    const application = applicationFactoryMock(1)[0]
    const keys = initStorage(register, application.storage || [])
    expect(register).toHaveBeenCalledTimes(3)

    if (application.storage) {
      expect(keys[0]).toBe(application.storage[0].id || '')
    }
  })
})
