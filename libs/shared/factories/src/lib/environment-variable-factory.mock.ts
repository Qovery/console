import { Chance } from 'chance'
import { APIVariableScopeEnum, APIVariableTypeEnum } from 'qovery-typescript-axios'
import { EnvironmentVariableEntity, SecretEnvironmentVariableEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const mockEnvironmentVariable = (isAlias = false, isOverride = false): EnvironmentVariableEntity => ({
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  aliased_variable: isAlias
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: APIVariableScopeEnum.PROJECT,
        value: chance.word().toString(),
        mount_path: '',
        variable_type: APIVariableTypeEnum.VALUE,
      }
    : undefined,
  overridden_variable: isOverride
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: APIVariableScopeEnum.PROJECT,
        value: chance.word().toString(),
        mount_path: '',
        variable_type: APIVariableTypeEnum.VALUE,
      }
    : undefined,
  variable_kind: 'public',
  service_name: chance.name().toString(),
  key: chance.word().toString(),
  value: chance.word().toString(),
  scope: APIVariableScopeEnum.PROJECT,
  variable_type: isOverride
    ? APIVariableTypeEnum.OVERRIDE
    : isAlias
    ? APIVariableTypeEnum.ALIAS
    : APIVariableTypeEnum.VALUE,
  mount_path: null,
})

export const mockSecretEnvironmentVariable = (
  isAlias = false,
  isOverride = false
): SecretEnvironmentVariableEntity => ({
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  aliased_secret: isAlias
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: APIVariableScopeEnum.PROJECT,
        mount_path: '',
        variable_type: APIVariableTypeEnum.VALUE,
      }
    : undefined,
  overridden_secret: isOverride
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: APIVariableScopeEnum.PROJECT,
        mount_path: '',
        variable_type: APIVariableTypeEnum.VALUE,
      }
    : undefined,
  variable_kind: 'secret',
  key: chance.word().toString(),
  scope: APIVariableScopeEnum.PROJECT,
  variable_type: isOverride
    ? APIVariableTypeEnum.OVERRIDE
    : isAlias
    ? APIVariableTypeEnum.ALIAS
    : APIVariableTypeEnum.VALUE,
})

export const environmentVariableFactoryMock = (
  howMany: number,
  aliases = false,
  overrides = false
): EnvironmentVariableEntity[] =>
  Array.from({ length: howMany }).map((_, index) => mockEnvironmentVariable(aliases, overrides))

export const secretEnvironmentVariableFactoryMock = (
  howMany: number,
  aliases = false,
  overrides = false
): SecretEnvironmentVariableEntity[] =>
  Array.from({ length: howMany }).map((_, index) => mockSecretEnvironmentVariable(aliases, overrides))
