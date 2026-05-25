import { type ApplicationResourcesData } from '@qovery/shared/interfaces'

export type CpuArchitectureRequest = Exclude<ApplicationResourcesData['cpu_architecture'], 'DEFAULT' | undefined>

export function toCpuArchitectureRequest(
  cpuArchitecture?: ApplicationResourcesData['cpu_architecture']
): CpuArchitectureRequest | null | undefined {
  if (!cpuArchitecture) {
    return undefined
  }

  return cpuArchitecture === 'DEFAULT' ? null : cpuArchitecture
}
