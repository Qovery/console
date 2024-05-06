import { APIVariableScopeEnum, APIVariableTypeEnum, type VariableResponse } from 'qovery-typescript-axios'
import { environmentVariableFile, getEnvironmentVariableFileMountPath } from './environment-variable-file'

describe('isEnvironmentVariableFile', () => {
  it('should return true if variable is a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.FILE,
      service_name: 'service_name',
      mount_path: 'mount_path',
    }
    expect(environmentVariableFile(variable)).toBeTruthy()
  })

  it('should return false if variable is not a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.VALUE,
      service_name: 'service_name',
      mount_path: 'mount_path',
    }
    expect(environmentVariableFile(variable)).toBeFalsy()
  })

  it('should return true if alias parent is a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.ALIAS,
      service_name: 'service_name',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.FILE,
        mount_path: 'mount_path',
      },
    }
    expect(environmentVariableFile(variable)).toBeTruthy()
  })

  it('should return false if alias parent is not a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.ALIAS,
      service_name: 'service_name',
      mount_path: 'mount_path',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.VALUE,
        mount_path: '',
      },
    }
    expect(environmentVariableFile(variable)).toBeFalsy()
  })

  it('should return false if override parent is not a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.OVERRIDE,
      service_name: 'service_name',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.VALUE,
        mount_path: 'mount_path',
      },
    }
    expect(environmentVariableFile(variable)).toBeFalsy()
  })

  it('should return true if override parent is a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.OVERRIDE,
      service_name: 'service_name',
      mount_path: 'mount_path',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.FILE,
        mount_path: 'mount_path',
      },
    }
    expect(environmentVariableFile(variable)).toBeTruthy()
  })
})

describe('getEnvironmentVariableFileMountPath', () => {
  it('should return mounthPath if variable is a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.FILE,
      service_name: 'public',
      mount_path: 'mount_path',
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBe('mount_path')
  })

  it('should return undefined if variable is not a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      service_name: 'test',
      variable_type: APIVariableTypeEnum.VALUE,
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBeUndefined()
  })

  it('should return mountPath if alias parent is a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.ALIAS,
      service_name: 'service_name',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.FILE,
        mount_path: 'mount_path',
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBe('mount_path')
  })

  it('should return undefined if alias parent is not a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.ALIAS,
      service_name: 'service_name',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.VALUE,
        mount_path: '',
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBeUndefined()
  })

  it('should return undefined if override parent is not a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.OVERRIDE,
      service_name: 'service_name',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        mount_path: 'mount_path',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.VALUE,
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBeUndefined()
  })

  it('should return mountPath if override parent is a file', () => {
    const variable: VariableResponse = {
      id: 'id',
      key: 'key',
      value: null,
      is_secret: true,
      created_at: 'created_at',
      scope: APIVariableScopeEnum.APPLICATION,
      variable_type: APIVariableTypeEnum.OVERRIDE,
      service_name: 'service_name',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        variable_type: APIVariableTypeEnum.FILE,
        mount_path: 'mount_path',
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBe('mount_path')
  })
})
