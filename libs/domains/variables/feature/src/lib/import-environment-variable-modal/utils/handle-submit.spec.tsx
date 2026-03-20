import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { formatData, importVariablesWithMutations } from './handle-submit'

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

describe('importVariablesWithMutations()', () => {
  it('should skip variables already existing on the same scope when overwrite is disabled', async () => {
    const createVariable = jest.fn()
    const editVariable = jest.fn()
    const deleteVariable = jest.fn()

    await importVariablesWithMutations({
      vars: [
        {
          name: 'EXISTING_VAR',
          value: 'new-value',
          scope: APIVariableScopeEnum.TERRAFORM,
          is_secret: false,
        },
      ],
      overwriteEnabled: false,
      existingVars: [
        {
          id: 'variable-id',
          key: 'EXISTING_VAR',
          value: 'old-value',
          scope: APIVariableScopeEnum.TERRAFORM,
          is_secret: false,
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      projectId: 'project-id',
      environmentId: 'environment-id',
      serviceId: 'service-id',
      createVariable,
      editVariable,
      deleteVariable,
    })

    expect(createVariable).not.toHaveBeenCalled()
    expect(editVariable).not.toHaveBeenCalled()
    expect(deleteVariable).not.toHaveBeenCalled()
  })

  it('should delete and recreate a variable when overwrite is enabled and secret mode changes', async () => {
    const createVariable = jest.fn().mockResolvedValue(undefined)
    const editVariable = jest.fn()
    const deleteVariable = jest.fn().mockResolvedValue(undefined)

    await importVariablesWithMutations({
      vars: [
        {
          name: 'EXISTING_VAR',
          value: 'new-value',
          scope: APIVariableScopeEnum.TERRAFORM,
          is_secret: true,
        },
      ],
      overwriteEnabled: true,
      existingVars: [
        {
          id: 'variable-id',
          key: 'EXISTING_VAR',
          value: 'old-value',
          scope: APIVariableScopeEnum.TERRAFORM,
          is_secret: false,
          description: 'existing description',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      projectId: 'project-id',
      environmentId: 'environment-id',
      serviceId: 'service-id',
      createVariable,
      editVariable,
      deleteVariable,
    })

    expect(deleteVariable).toHaveBeenCalledWith({ variableId: 'variable-id' })
    expect(createVariable).toHaveBeenCalledWith({
      variableRequest: {
        key: 'EXISTING_VAR',
        value: 'new-value',
        is_secret: true,
        variable_scope: APIVariableScopeEnum.TERRAFORM,
        variable_parent_id: 'service-id',
        description: 'existing description',
        enable_interpolation_in_file: undefined,
      },
    })
    expect(editVariable).not.toHaveBeenCalled()
  })
})
