import { type ApplicationResourcesData } from '@qovery/shared/interfaces'

export type CpuArchitectureFormValue = ApplicationResourcesData['cpu_architecture']
export type CpuArchitectureRequest = Exclude<CpuArchitectureFormValue, 'DEFAULT' | undefined>

export function getCpuArchitectureSummaryValue(
  cpuArchitecture?: CpuArchitectureFormValue
): CpuArchitectureRequest | undefined {
  return cpuArchitecture && cpuArchitecture !== 'DEFAULT' ? cpuArchitecture : undefined
}

export function toCpuArchitectureRequest(
  cpuArchitecture?: CpuArchitectureFormValue
): CpuArchitectureRequest | null | undefined {
  if (!cpuArchitecture) {
    return undefined
  }

  return getCpuArchitectureSummaryValue(cpuArchitecture) ?? null
}
