import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'

export type ServiceVariableScope = 'APPLICATION' | 'CONTAINER' | 'JOB' | 'HELM' | 'TERRAFORM'

export function getServiceVariableScope(serviceType?: ServiceType): ServiceVariableScope | undefined
export function getServiceVariableScope(
  serviceType: ServiceType | undefined,
  fallbackScope: ServiceVariableScope
): ServiceVariableScope
export function getServiceVariableScope(
  serviceType?: ServiceType,
  fallbackScope?: ServiceVariableScope
): ServiceVariableScope | undefined {
  return match(serviceType)
    .with('APPLICATION', () => 'APPLICATION' as const)
    .with('CONTAINER', () => 'CONTAINER' as const)
    .with('JOB', () => 'JOB' as const)
    .with('HELM', () => 'HELM' as const)
    .with('TERRAFORM', () => 'TERRAFORM' as const)
    .otherwise(() => fallbackScope)
}
