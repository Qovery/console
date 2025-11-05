/**
 * Generates a documentation URL for an advanced setting key
 * @param key - The setting key (e.g., "allow_service_cpu_overcommit" or "aws.eks.ec2.ami")
 * @param type - The type of setting: "cluster" or "service"
 * @returns The full URL to the documentation
 *
 * @example
 * generateAdvancedSettingDocUrl("allow_service_cpu_overcommit", "cluster")
 * // Returns: "https://hub.qovery.com/docs/using-qovery/configuration/cluster-advanced-settings/#allow_service_cpu_overcommit"
 *
 * @example
 * generateAdvancedSettingDocUrl("aws.eks.ec2.ami", "cluster")
 * // Returns: "https://hub.qovery.com/docs/using-qovery/configuration/cluster-advanced-settings/#awseksec2ami"
 *
 * @example
 * generateAdvancedSettingDocUrl("build.timeout_max_sec", "service")
 * // Returns: "https://hub.qovery.com/docs/using-qovery/configuration/advanced-settings/#buildtimeout_max_sec"
 */
export function generateAdvancedSettingDocUrl(key: string, type: 'cluster' | 'service'): string {
  const baseUrl = 'https://hub.qovery.com/docs/using-qovery/configuration'
  const path = type === 'cluster' ? 'cluster-advanced-settings' : 'advanced-settings'
  const anchor = key.replace(/\./g, '') // Remove all dots from the key

  return `${baseUrl}/${path}/#${anchor}`
}
