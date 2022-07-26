import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { EnvironmentVariableSecretOrPublic } from '@console/shared/interfaces'

export const computeAvailableScope = (
  variable?: EnvironmentVariableSecretOrPublic,
  includeBuiltIn?: boolean
): EnvironmentVariableScopeEnum[] => {
  if (!variable) {
    const scopeToReturn = []

    if (includeBuiltIn) {
      scopeToReturn.push(EnvironmentVariableScopeEnum.BUILT_IN)
    }

    return [
      ...scopeToReturn,
      EnvironmentVariableScopeEnum.PROJECT,
      EnvironmentVariableScopeEnum.ENVIRONMENT,
      EnvironmentVariableScopeEnum.APPLICATION,
    ]
  }

  const environmentScopes: {
    name: EnvironmentVariableScopeEnum
    hierarchy: number
  }[] = [
    {
      name: EnvironmentVariableScopeEnum.BUILT_IN,
      hierarchy: -1,
    },
    {
      name: EnvironmentVariableScopeEnum.PROJECT,
      hierarchy: 1,
    },
    {
      name: EnvironmentVariableScopeEnum.ENVIRONMENT,
      hierarchy: 2,
    },
    {
      name: EnvironmentVariableScopeEnum.APPLICATION,
      hierarchy: 3,
    },
  ]

  const theScope = environmentScopes.find((s) => s.name === variable?.scope)

  return environmentScopes
    .filter((scope) => {
      return scope.hierarchy >= (theScope?.hierarchy || -1) && scope.hierarchy >= 0
    })
    .map((scope) => scope.name)
}
