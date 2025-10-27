import { type ClusterFeatureResponse } from 'qovery-typescript-axios'

/**
 * Extracts the actual value from a cluster feature's value_object,
 * handling both old and new API formats for seamless migration.
 *
 * Old format: value_object.value = boolean | string
 * New format: value_object.value = { type: string, value: boolean | string, is_enabled: boolean }
 *
 * @param feature - The cluster feature response from the API
 * @returns The actual value (boolean or string) or undefined if not found
 */
export function getClusterFeatureValue(feature: ClusterFeatureResponse): boolean | string | undefined {
  const valueObject = feature.value_object

  if (!valueObject) {
    return undefined
  }

  const value = valueObject.value

  // Handle new format: value is an object with nested structure
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return (value as { value: boolean | string }).value
  }

  // Handle old format: value is a primitive (boolean or string)
  return value as boolean | string | undefined
}

/**
 * Checks if a cluster feature is enabled, handling both old and new API formats.
 *
 * @param feature - The cluster feature response from the API
 * @returns true if the feature is enabled, false otherwise
 */
export function isClusterFeatureEnabled(feature: ClusterFeatureResponse): boolean {
  const valueObject = feature.value_object

  if (!valueObject) {
    return false
  }

  const value = valueObject.value

  // Handle new format: value is an object with is_enabled field
  if (typeof value === 'object' && value !== null && 'is_enabled' in value) {
    return Boolean((value as { is_enabled: boolean }).is_enabled)
  }

  // Handle old format: value is a boolean directly
  if (typeof value === 'boolean') {
    return value
  }

  // Handle old format: value is a string (means it's enabled with a custom value)
  if (typeof value === 'string') {
    return true
  }

  return false
}

/**
 * Gets the type of value from a cluster feature's value_object,
 * useful for determining if it's a simple boolean or requires extended input.
 *
 * @param feature - The cluster feature response from the API
 * @returns 'boolean', 'string', 'object', or undefined
 */
export function getClusterFeatureValueType(
  feature: ClusterFeatureResponse
): 'boolean' | 'string' | 'object' | undefined {
  const value = getClusterFeatureValue(feature)

  if (value === undefined) {
    return undefined
  }

  if (typeof value === 'boolean') {
    return 'boolean'
  }

  if (typeof value === 'string') {
    return 'string'
  }

  return 'object'
}
