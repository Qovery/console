import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type ServiceTypeEnum } from '@qovery/shared/enums'
import { upperCaseFirstLetter } from './uppercase-first-letter'

function scopeHierarchy(targetScope: APIVariableScopeEnum) {
  const baseHierarchy = [
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
  ]

  return match(targetScope)
    .with('BUILT_IN', () => baseHierarchy.slice(0, 1))
    .with('PROJECT', () => baseHierarchy.slice(0, 2))
    .with('ENVIRONMENT', () => baseHierarchy)
    .with('APPLICATION', 'CONTAINER', 'HELM', 'JOB', (serviceScope) => [
      ...baseHierarchy,
      {
        name: serviceScope,
        hierarchy: 3,
      },
    ])
    .exhaustive()
}

function targetToScope(target: keyof typeof APIVariableScopeEnum | keyof typeof ServiceTypeEnum): APIVariableScopeEnum {
  return match(target)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('DATABASE', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', 'CRON_JOB', 'LIFECYCLE_JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .with('BUILT_IN', () => APIVariableScopeEnum.BUILT_IN)
    .with('PROJECT', () => APIVariableScopeEnum.PROJECT)
    .with('ENVIRONMENT', () => APIVariableScopeEnum.ENVIRONMENT)
    .exhaustive()
}

export const computeAvailableScope = (
  base?: APIVariableScopeEnum,
  includeBuiltIn?: boolean,
  target?: keyof typeof APIVariableScopeEnum | keyof typeof ServiceTypeEnum,
  excludeBaseScope = false
): APIVariableScopeEnum[] => {
  const baseScope = base ?? 'BUILT_IN'
  const targetScope = targetToScope(target ?? 'APPLICATION')
  const hierarchy = scopeHierarchy(targetScope)

  const baseScopeHierarchy = hierarchy.find((scope) => scope.name === baseScope)?.hierarchy ?? -1
  const targetScopeHierarchy = hierarchy.find((scope) => scope.name === targetScope)?.hierarchy ?? 3

  return hierarchy
    .reduce<APIVariableScopeEnum[]>((acc, scope) => {
      if (scope.hierarchy >= baseScopeHierarchy && scope.hierarchy <= targetScopeHierarchy) {
        acc.push(scope.name)
      }
      return acc
    }, [])
    .filter((s) => (includeBuiltIn ? true : s !== 'BUILT_IN'))
    .filter((s) => (excludeBaseScope ? s !== baseScope : true))
}

export function getScopeHierarchy(
  base?: APIVariableScopeEnum,
  target?: keyof typeof APIVariableScopeEnum | keyof typeof ServiceTypeEnum
): number {
  if (!base) return -1

  const targetScope = targetToScope(target ?? 'APPLICATION')
  return scopeHierarchy(targetScope).find((scope) => scope.name === base)?.hierarchy ?? -1
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
