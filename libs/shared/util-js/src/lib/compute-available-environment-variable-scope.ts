import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { upperCaseFirstLetter } from './uppercase-first-letter'

const environmentScopes = (scope: APIVariableScopeEnum) => [
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
    name: scope,
    hierarchy: 3,
  },
]

export const computeAvailableScope = (
  scope?: APIVariableScopeEnum,
  includeBuiltIn?: boolean,
  serviceType?: ServiceType,
  excludeCurrentScope: boolean = false
): APIVariableScopeEnum[] => {
  const scopeByServiceType = match(serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .otherwise(() => APIVariableScopeEnum.APPLICATION)

  if (!scope) {
    const scopeToReturn: APIVariableScopeEnum[] = []

    if (includeBuiltIn) {
      scopeToReturn.push(APIVariableScopeEnum.BUILT_IN)
    }

    return [...scopeToReturn, APIVariableScopeEnum.PROJECT, APIVariableScopeEnum.ENVIRONMENT, scopeByServiceType]
  }

  const theScope = environmentScopes(scopeByServiceType).find((s) => s.name === scope)

  return environmentScopes(scopeByServiceType)
    .filter((scope) => {
      return scope.hierarchy >= (theScope?.hierarchy || -1) && scope.hierarchy >= 0
    })
    .map((scope) => scope.name)
    .filter((s) => (excludeCurrentScope ? s !== scope : true))
}

export function getScopeHierarchy(scope?: APIVariableScopeEnum, serviceType?: ServiceType): number {
  if (!scope) return -1

  const scopeByServiceType = match(serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .otherwise(() => APIVariableScopeEnum.APPLICATION)

  const hierarchy = environmentScopes(scopeByServiceType).find((s) => s.name === scope)?.hierarchy

  return hierarchy || -1
}

export function generateScopeLabel(scope: APIVariableScopeEnum): string {
  if (
    scope === APIVariableScopeEnum.APPLICATION ||
    scope === APIVariableScopeEnum.JOB ||
    scope === APIVariableScopeEnum.CONTAINER ||
    scope === APIVariableScopeEnum.HELM
  )
    return 'Service'
  return upperCaseFirstLetter(scope) as string
}
