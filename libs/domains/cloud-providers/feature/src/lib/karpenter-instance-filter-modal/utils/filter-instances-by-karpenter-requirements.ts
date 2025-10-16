import {
  type ClusterInstanceTypeResponseListResultsInner,
  type KarpenterNodePoolRequirement,
} from 'qovery-typescript-axios'

export function filterInstancesByKarpenterRequirements(
  allInstances: ClusterInstanceTypeResponseListResultsInner[],
  requirements: KarpenterNodePoolRequirement[] = []
): ClusterInstanceTypeResponseListResultsInner[] {
  return allInstances.filter((instance) => {
    const instanceSize = instance.attributes?.instance_size || ''
    const InstanceFamily = instance.attributes?.instance_family || ''
    const instanceArchitecture = instance.architecture || ''

    return requirements.every((requirement) => {
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
