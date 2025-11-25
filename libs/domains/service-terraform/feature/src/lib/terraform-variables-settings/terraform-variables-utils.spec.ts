import { type UIVariable } from './terraform-variables-context'
import { isVariableChanged } from './terraform-variables-utils'

describe('Terraform variables utility functions', () => {
  describe('isVariableChanged', () => {
    it('should return false if nothing has changed', () => {
      const variable: UIVariable = {
        id: '1',
        key: 'test',
        value: 'test',
        source: 'test',
        secret: false,
        originalKey: 'test',
        originalValue: 'test',
        originalSecret: false,
        isNew: false,
      }
      expect(isVariableChanged(variable)).toBe(false)
    })

    it('should return true if the variable is new', () => {
      const variable: UIVariable = {
        id: '1',
        key: 'test',
        value: 'test',
        source: 'test',
        secret: false,
        isNew: true,
      }
      expect(isVariableChanged(variable)).toBe(true)
    })

    it('should return true if the variable value has been changed', () => {
      const variable: UIVariable = {
        id: '1',
        key: 'test',
        value: 'new value',
        source: 'test',
        secret: false,
        originalKey: 'test',
        originalValue: 'original value',
        originalSecret: false,
        isNew: false,
      }
      expect(isVariableChanged(variable)).toBe(true)
    })

    it('should return true if the variable key has been changed', () => {
      const variable: UIVariable = {
        id: '1',
        key: 'new key',
        value: 'original value',
        source: 'test',
        secret: false,
        originalKey: 'original key',
        originalValue: 'original value',
        originalSecret: false,
        isNew: false,
      }
      expect(isVariableChanged(variable)).toBe(true)
    })

    it('should return true if the variable secret has been changed', () => {
      const variable: UIVariable = {
        id: '1',
        key: 'test',
        value: 'original value',
        source: 'test',
        secret: true,
        originalKey: 'test',
        originalValue: 'original value',
        originalSecret: false,
        isNew: false,
      }
      expect(isVariableChanged(variable)).toBe(true)
    })
  })
})
