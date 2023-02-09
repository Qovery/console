import { APIVariableScopeEnum, APIVariableTypeEnum } from 'qovery-typescript-axios'
import { EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { environmentVariableFile, getEnvironmentVariableFileMountPath } from './environment-variable-file'

describe('isEnvironmentVariableFile', () => {
  it('should return true if variable is a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.FILE,
      variable_type: 'secret',
      service_name: 'service_name',
      mount_path: 'mount_path',
    }
    expect(environmentVariableFile(variable)).toBeTruthy()
  })

  it('should return false if variable is not a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.VALUE,
      variable_type: 'secret',
      service_name: 'service_name',
      mount_path: 'mount_path',
    }
    expect(environmentVariableFile(variable)).toBeFalsy()
  })

  it('should return true if alias parent is a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.ALIAS,
      variable_type: 'secret',
      service_name: 'service_name',
      mount_path: 'mount_path',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.FILE,
      },
    }
    expect(environmentVariableFile(variable)).toBeTruthy()
  })

  it('should return false if alias parent is not a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.ALIAS,
      variable_type: 'secret',
      service_name: 'service_name',
      mount_path: 'mount_path',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.VALUE,
      },
    }
    expect(environmentVariableFile(variable)).toBeFalsy()
  })

  it('should return false if override parent is not a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.OVERRIDE,
      variable_type: 'secret',
      service_name: 'service_name',
      mount_path: 'mount_path',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.VALUE,
      },
    }
    expect(environmentVariableFile(variable)).toBeFalsy()
  })

  it('should return true if override parent is a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.OVERRIDE,
      variable_type: 'secret',
      service_name: 'service_name',
      mount_path: 'mount_path',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.FILE,
      },
    }
    expect(environmentVariableFile(variable)).toBeTruthy()
  })
})

describe('getEnvironmentVariableFileMountPath', () => {
  it('should return mounthPath if variable is a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.FILE,
      variable_type: 'secret',
      service_name: 'public',
      mount_path: 'mount_path',
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBe('mount_path')
  })

  it('should return undefined if variable is not a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.VALUE,
      variable_type: 'secret',
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBeUndefined()
  })

  it('should return mountPath if alias parent is a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.ALIAS,
      variable_type: 'secret',
      service_name: 'service_name',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.FILE,
        mount_path: 'mount_path',
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBe('mount_path')
  })

  it('should return undefined if alias parent is not a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.ALIAS,
      variable_type: 'secret',
      service_name: 'service_name',
      aliased_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.VALUE,
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBeUndefined()
  })

  it('should return undefined if override parent is not a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.OVERRIDE,
      variable_type: 'secret',
      service_name: 'service_name',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.VALUE,
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBeUndefined()
  })

  it('should return mountPath if override parent is a file', () => {
    const variable: EnvironmentVariableSecretOrPublic = {
      id: 'id',
      value: 'value',
      type: APIVariableTypeEnum.OVERRIDE,
      variable_type: 'secret',
      service_name: 'service_name',
      overridden_variable: {
        id: 'id',
        value: 'value',
        key: 'key',
        scope: APIVariableScopeEnum.APPLICATION,
        type: APIVariableTypeEnum.FILE,
        mount_path: 'mount_path',
      },
    }
    expect(getEnvironmentVariableFileMountPath(variable)).toBe('mount_path')
  })
})
