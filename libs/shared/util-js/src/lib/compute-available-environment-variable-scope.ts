import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type ServiceTypeEnum, isContainer, isJob } from '@qovery/shared/enums'
import { upperCaseFirstLetter } from './uppercase-first-letter'

const environmentScopes = (serviceType?: ServiceTypeEnum) => [
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
    name: isJob(serviceType)
      ? APIVariableScopeEnum.JOB
      : isContainer(serviceType)
      ? APIVariableScopeEnum.CONTAINER
      : APIVariableScopeEnum.APPLICATION,
    hierarchy: 3,
  },
]

export const computeAvailableScope = (
  scope?: APIVariableScopeEnum,
  includeBuiltIn?: boolean,
  serviceType?: ServiceTypeEnum,
  excludeCurrentScope: boolean = false
) => {
  if (!scope) {
    const scopeToReturn: APIVariableScopeEnum[] = []

    if (includeBuiltIn) {
      scopeToReturn.push(APIVariableScopeEnum.BUILT_IN)
    }

    return [
      ...scopeToReturn,
      APIVariableScopeEnum.PROJECT,
      APIVariableScopeEnum.ENVIRONMENT,
      isJob(serviceType)
        ? APIVariableScopeEnum.JOB
        : isContainer(serviceType)
        ? APIVariableScopeEnum.CONTAINER
        : APIVariableScopeEnum.APPLICATION,
    ] as APIVariableScopeEnum[]
  }

  const theScope = environmentScopes(serviceType).find((s) => s.name === scope)

  return environmentScopes(serviceType)
    .filter((scope) => {
      return scope.hierarchy >= (theScope?.hierarchy || -1) && scope.hierarchy >= 0
    })
    .map((scope) => scope.name)
    .filter((s) => (excludeCurrentScope ? s !== scope : true)) as APIVariableScopeEnum[]
}

export function getScopeHierarchy(scope?: APIVariableScopeEnum, serviceType?: ServiceTypeEnum): number {
  if (!scope) return -1

  const hierarchy = environmentScopes(serviceType).find((s) => s.name === scope)?.hierarchy

  return hierarchy || -1
}

export function generateScopeLabel(scope: APIVariableScopeEnum): string {
  if (
    scope === APIVariableScopeEnum.APPLICATION ||
    scope === APIVariableScopeEnum.JOB ||
    scope === APIVariableScopeEnum.CONTAINER
  )
    return 'Service'
  return upperCaseFirstLetter(scope) as string
}
