const escapeLabelValue = (value: string) => value.replace(/"/g, '\\"')

// Escape only truly problematic characters for Prometheus regex
// Hyphens (-) don't need escaping in Prometheus regex
const escapePrometheusRegex = (value: string) => {
  // Only escape: . * + ? ^ $ { } [ ] ( ) | \
  return value.replace(/[.*+?^${}[\]()|\\]/g, '\\$&')
}

export const buildPromSelector = (containerName: string, podNames?: string[]) => {
  if (podNames && podNames.length > 0) {
    const podFilter = podNames.map((pod) => escapePrometheusRegex(pod)).join('|')
    return `pod=~"${podFilter}"`
  }

  return `container="${escapeLabelValue(containerName)}"`
}
