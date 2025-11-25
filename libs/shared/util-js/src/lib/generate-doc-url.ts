/**
 * Generates a documentation URL for an advanced setting key
 * @param key - The setting key (e.g., "allow_service_cpu_overcommit" or "aws.eks.ec2.ami")
 * @param type - The type of setting: "cluster" or "service"
 * @returns The full URL to the documentation
 *
 * @example
 * generateAdvancedSettingDocUrl("allow_service_cpu_overcommit", "cluster")
 * // Returns: "https://www.qovery.com/docs/configuration/cluster-advanced-settings#allow-service-cpu-overcommit"
 *
 * @example
 * generateAdvancedSettingDocUrl("aws.eks.ec2.ami", "cluster")
 * // Returns: "https://www.qovery.com/docs/configuration/cluster-advanced-settings#aws-eks-ec2-ami"
 *
 * @example
 * generateAdvancedSettingDocUrl("build.timeout_max_sec", "service")
 * // Returns: "https://www.qovery.com/docs/configuration/service-advanced-settings#build-timeout-max-sec"
 */
export function generateAdvancedSettingDocUrl(key: string, type: 'cluster' | 'service'): string {
  const baseUrl = 'https://www.qovery.com/docs/configuration'
  const path = type === 'cluster' ? 'cluster-advanced-settings' : 'service-advanced-settings'
  const anchor = key.replace(/[._]/g, '-') // Replace dots and underscores with hyphens

  return `${baseUrl}/${path}#${anchor}`
}
