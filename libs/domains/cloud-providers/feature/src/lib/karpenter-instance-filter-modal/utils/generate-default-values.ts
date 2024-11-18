import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios'
import { type KarpenterInstanceFormProps } from '../karpenter-instance-filter-modal'

export function generateDefaultValues(
  instances: ClusterInstanceTypeResponseListResultsInner[]
): Omit<KarpenterInstanceFormProps, 'default_service_architecture'> {
  // Get unique architectures
  const architectures = [...new Set(instances.map((i) => i.architecture))]

  // Get unique sizes without sorting
  const sizes = [...new Set(instances.map((i) => i.attributes?.instance_size ?? ''))].filter((i) => i !== '')

  // Group instance families by raw instance_category
  const categories: Record<string, string[]> = {}
  instances.forEach((instance) => {
    const family = instance.attributes?.instance_family || ''
    const category = instance.attributes?.instance_category || ''

    if (!categories[category]) {
      categories[category] = []
    }

    if (!categories[category].includes(family)) {
      categories[category].push(family)
    }
  })

  return {
    ARM64: architectures.includes('ARM64'),
    AMD64: architectures.includes('AMD64'),
    categories,
    sizes,
  }
}

export default generateDefaultValues
