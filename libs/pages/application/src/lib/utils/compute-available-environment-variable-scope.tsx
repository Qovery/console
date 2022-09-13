import { APIVariableScopeEnum } from 'qovery-typescript-axios'

const environmentScopes: {
  name: APIVariableScopeEnum
  hierarchy: number
}[] = [
  {
    name: APIVariableScopeEnum.BUILT_IN,
    hierarchy: -1,
  },
  {
    name: APIVariableScopeEnum.PROJECT,
    hierarchy: 1,
  },
  {
    name: APIVariableScopeEnum.ENVIRONMENT,
    hierarchy: 2,
  },
  {
    name: APIVariableScopeEnum.APPLICATION,
    hierarchy: 3,
  },
]

export const computeAvailableScope = (
  scope?: APIVariableScopeEnum,
  includeBuiltIn?: boolean
): APIVariableScopeEnum[] => {
  if (!scope) {
    const scopeToReturn = []

    if (includeBuiltIn) {
      scopeToReturn.push(APIVariableScopeEnum.BUILT_IN)
    }

    return [
      ...scopeToReturn,
      APIVariableScopeEnum.PROJECT,
      APIVariableScopeEnum.ENVIRONMENT,
      APIVariableScopeEnum.APPLICATION,
    ]
  }

  const theScope = environmentScopes.find((s) => s.name === scope)

  return environmentScopes
    .filter((scope) => {
      return scope.hierarchy >= (theScope?.hierarchy || -1) && scope.hierarchy >= 0
    })
    .map((scope) => scope.name)
}

export function getScopeHierarchy(scope?: APIVariableScopeEnum): number {
  if (!scope) return -1

  const hierarchy = environmentScopes.find((s) => s.name === scope)?.hierarchy

  return hierarchy || -1
}
