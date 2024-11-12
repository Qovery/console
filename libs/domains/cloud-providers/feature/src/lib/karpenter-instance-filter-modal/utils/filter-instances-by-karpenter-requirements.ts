import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { type KarpenterData } from '@qovery/shared/interfaces'

export function filterInstancesByKarpenterRequirements(
  allInstances: ClusterInstanceTypeResponseListResultsInner[],
  karpenterData: Omit<KarpenterData, 'disk_size_in_gib' | 'enabled' | 'spot_enabled'>
): ClusterInstanceTypeResponseListResultsInner[] {
  const karpenterRequirements = karpenterData.qovery_node_pools?.requirements || []

  return allInstances.filter((instance) => {
    const instanceSize = instance.attributes?.instance_size || ''
    const InstanceFamily = instance.attributes?.instance_family || ''
    const instanceArchitecture = instance.architecture || ''

    return karpenterRequirements.every((requirement) => {
      if (requirement.key === 'InstanceSize') {
        return requirement.values.includes(instanceSize)
      }

      if (requirement.key === 'Arch') {
        // Fix inconsistency between uppercase and lowercase with architecture during the migration
        return requirement.values.map((v) => v.toUpperCase()).includes(instanceArchitecture)
      }

      if (requirement.key === 'InstanceFamily') {
        return requirement.values.includes(InstanceFamily)
      }

      return false
    })
  })
}

export default filterInstancesByKarpenterRequirements
