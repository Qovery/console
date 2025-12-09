import { type TerraformVariableDefinition } from 'qovery-typescript-axios'
import { type UIVariable } from './terraform-variables-context'
import { buildDescriptionByKey, isVariableChanged } from './terraform-variables-utils'

describe('Terraform variables utility functions', () => {
  describe('buildDescriptionByKey', () => {
    it('should return an empty object when variablesResponse is undefined', () => {
      expect(buildDescriptionByKey(undefined)).toEqual({})
    })

    it('should return an empty object when variablesResponse is an empty array', () => {
      expect(buildDescriptionByKey([])).toEqual({})
    })

    it('should map variable keys to their descriptions', () => {
      const variables: TerraformVariableDefinition[] = [
        { key: 'aws_region', description: 'The AWS region to deploy to' },
        { key: 'instance_type', description: 'EC2 instance type' },
      ]
      expect(buildDescriptionByKey(variables)).toEqual({
        aws_region: 'The AWS region to deploy to',
        instance_type: 'EC2 instance type',
      })
    })

    it('should handle variables without descriptions', () => {
      const variables: TerraformVariableDefinition[] = [
        { key: 'aws_region', description: 'The AWS region' },
        { key: 'instance_type' }, // no description
      ]
      expect(buildDescriptionByKey(variables)).toEqual({
        aws_region: 'The AWS region',
        instance_type: undefined,
      })
    })

    it('should filter out variables without keys', () => {
      const variables: TerraformVariableDefinition[] = [
        { key: 'valid_key', description: 'Valid description' },
        { description: 'No key variable' } as TerraformVariableDefinition, // missing key
        { key: '', description: 'Empty key' }, // empty key (falsy)
      ]
      expect(buildDescriptionByKey(variables)).toEqual({
        valid_key: 'Valid description',
      })
    })
  })
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
