import { Chance } from 'chance'
import { APIVariableScopeEnum, APIVariableTypeEnum, type VariableResponse } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const mockEnvironmentVariable = (isAlias = false, isOverride = false): VariableResponse => ({
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
  service_name: chance.name().toString(),
  key: chance.word().toString(),
  value: chance.word().toString(),
  is_secret: false,
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
  isOverride = false,
  ownedBy = 'QOVERY'
): VariableResponse => ({
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  aliased_variable: isAlias
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: APIVariableScopeEnum.PROJECT,
        mount_path: '',
        variable_type: APIVariableTypeEnum.VALUE,
      }
    : undefined,
  overridden_variable: isOverride
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: APIVariableScopeEnum.PROJECT,
        mount_path: '',
        variable_type: APIVariableTypeEnum.VALUE,
      }
    : undefined,
  value: null,
  is_secret: true,
  key: chance.word().toString(),
  scope: APIVariableScopeEnum.PROJECT,
  variable_type: isOverride
    ? APIVariableTypeEnum.OVERRIDE
    : isAlias
      ? APIVariableTypeEnum.ALIAS
      : APIVariableTypeEnum.VALUE,
  owned_by: ownedBy,
})

export const environmentVariableFactoryMock = (
  howMany: number,
  aliases = false,
  overrides = false
): VariableResponse[] => Array.from({ length: howMany }).map((_, index) => mockEnvironmentVariable(aliases, overrides))

export const secretEnvironmentVariableFactoryMock = (
  howMany: number,
  aliases = false,
  overrides = false
): VariableResponse[] =>
  Array.from({ length: howMany }).map((_, index) => mockSecretEnvironmentVariable(aliases, overrides))
