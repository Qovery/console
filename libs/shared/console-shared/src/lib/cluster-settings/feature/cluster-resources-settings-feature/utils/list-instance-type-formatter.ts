import { ClusterInstanceTypeResponseListResults } from 'qovery-typescript-axios'
import { Value } from '@qovery/shared/interfaces'

export function listInstanceTypeFormatter(list: ClusterInstanceTypeResponseListResults[]): Value[] {
  return list
    .sort((a, b) => {
      return a.cpu - b.cpu || a.ram_in_gb - b.ram_in_gb
    })
    .map((v) => {
      return {
        label: `${v.name} (${v.cpu}CPU - ${v.ram_in_gb}GB RAM)`,
        value: v.type,
      }
    })
}
