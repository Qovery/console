import { Chance } from 'chance'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { EnvironmentVariableEntity, SecretEnvironmentVariableEntity } from '@console/shared/interfaces'

const chance = new Chance()

export const mockEnvironmentVariable = (isAlias = false, isOverride = false): EnvironmentVariableEntity => ({
  id: chance.integer().toString(),
  created_at: chance.date().toString(),
  updated_at: chance.date().toString(),
  aliased_variable: isAlias
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: EnvironmentVariableScopeEnum.BUILT_IN,
        value: chance.word().toString(),
      }
    : undefined,
  overridden_variable: isOverride
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: EnvironmentVariableScopeEnum.BUILT_IN,
        value: chance.word().toString(),
      }
    : undefined,
  variable_type: 'public',
  service_name: chance.name().toString(),
  key: chance.word().toString(),
  value: chance.word().toString(),
  scope: EnvironmentVariableScopeEnum.BUILT_IN,
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
        scope: EnvironmentVariableScopeEnum.BUILT_IN,
      }
    : undefined,
  overridden_secret: isOverride
    ? {
        id: chance.integer().toString(),
        key: chance.word().toString(),
        scope: EnvironmentVariableScopeEnum.BUILT_IN,
      }
    : undefined,
  variable_type: 'secret',
  key: chance.word().toString(),
  scope: EnvironmentVariableScopeEnum.BUILT_IN,
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
