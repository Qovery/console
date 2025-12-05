import { type TerraformVariableDefinition } from 'qovery-typescript-axios'
import { type UIVariable } from './terraform-variables-context'
import { buildMetadataByKey, isVariableChanged } from './terraform-variables-utils'

describe('Terraform variables utility functions', () => {
  describe('buildMetadataByKey', () => {
    it('should return an empty object when variablesResponse is undefined', () => {
      expect(buildMetadataByKey(undefined)).toEqual({})
    })

    it('should return an empty object when variablesResponse is an empty array', () => {
      expect(buildMetadataByKey([])).toEqual({})
    })

    it('should map variable keys to their metadata', () => {
      const variables = [
        { key: 'aws_region', description: 'The AWS region to deploy to', nullable: false },
        { key: 'instance_type', description: 'EC2 instance type', nullable: true },
      ] as TerraformVariableDefinition[]
      expect(buildMetadataByKey(variables)).toEqual({
        aws_region: { description: 'The AWS region to deploy to', nullable: false },
        instance_type: { description: 'EC2 instance type', nullable: true },
      })
    })

    it('should handle variables without descriptions and default nullable to true', () => {
      const variables = [
        { key: 'aws_region', description: 'The AWS region' },
        { key: 'instance_type' }, // no description, no nullable
      ] as TerraformVariableDefinition[]
      expect(buildMetadataByKey(variables)).toEqual({
        aws_region: { description: 'The AWS region', nullable: true },
        instance_type: { description: undefined, nullable: true },
      })
    })

    it('should filter out variables without keys', () => {
      const variables = [
        { key: 'valid_key', description: 'Valid description', nullable: false },
        { description: 'No key variable' } as TerraformVariableDefinition, // missing key
        { key: '', description: 'Empty key' }, // empty key (falsy)
      ] as TerraformVariableDefinition[]
      expect(buildMetadataByKey(variables)).toEqual({
        valid_key: { description: 'Valid description', nullable: false },
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
