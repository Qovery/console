import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { type Value } from '@qovery/shared/interfaces'

export function listInstanceTypeFormatter(list: ClusterInstanceTypeResponseListResultsInner[]): Value[] {
  const cloneList = [...list]
  return cloneList
    .sort((a, b) => {
      return a.cpu - b.cpu || a.ram_in_gb - b.ram_in_gb
    })
    .map((v) => {
      return {
        label: `${v.name} (${v.cpu}CPU - ${v.ram_in_gb}GB RAM - ${v.architecture})`,
        value: v.type,
      }
    })
}
