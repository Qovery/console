import {
  type ClusterInstanceTypeResponseListResultsInner,
  type KarpenterNodePoolRequirement,
} from 'qovery-typescript-axios'

export function convertToKarpenterRequirements(
  instance: ClusterInstanceTypeResponseListResultsInner[]
): KarpenterNodePoolRequirement[] {
  if (!instance || instance.length === 0) {
    return []
  }

  const requirements: KarpenterNodePoolRequirement[] = []

  const uniqueValues = {
    architectures: new Set<string>(),
    families: new Set<string>(),
    sizes: new Set<string>(),
  }

  instance.forEach((instance) => {
    if (instance.architecture) {
      uniqueValues.architectures.add(instance.architecture)
    }

    if (instance.attributes?.instance_family) {
      uniqueValues.families.add(instance.attributes.instance_family)
    }
    if (instance.attributes?.instance_size) {
      uniqueValues.sizes.add(instance.attributes.instance_size)
    }
  })

  if (uniqueValues.sizes.size > 0) {
    requirements.push({
      key: 'InstanceSize',
      operator: 'In',
      values: Array.from(uniqueValues.sizes),
    })
  }

  if (uniqueValues.architectures.size > 0) {
    requirements.push({
      key: 'Arch',
      operator: 'In',
      values: Array.from(uniqueValues.architectures),
    })
  }

  if (uniqueValues.families.size > 0) {
    requirements.push({
      key: 'InstanceFamily',
      operator: 'In',
      values: Array.from(uniqueValues.families),
    })
  }

  return requirements
}
