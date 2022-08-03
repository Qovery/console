import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'

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

export const computeAvailableScope = (
  scope?: EnvironmentVariableScopeEnum,
  includeBuiltIn?: boolean
): EnvironmentVariableScopeEnum[] => {
  if (!scope) {
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

  const theScope = environmentScopes.find((s) => s.name === scope)

  return environmentScopes
    .filter((scope) => {
      return scope.hierarchy >= (theScope?.hierarchy || -1) && scope.hierarchy >= 0
    })
    .map((scope) => scope.name)
}

export function getScopeHierarchy(scope?: EnvironmentVariableScopeEnum): number {
  if (!scope) return -1

  const hierarchy = environmentScopes.find((s) => s.name === scope)?.hierarchy

  return hierarchy || -1
}
