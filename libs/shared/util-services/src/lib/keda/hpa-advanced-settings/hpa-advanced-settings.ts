/**
 * Loads HPA settings from advanced settings for form initialization
 */
export function loadHpaSettingsFromAdvancedSettings(advancedSettings?: unknown): {
  hpa_metric_type: 'CPU' | 'CPU_AND_MEMORY'
  hpa_cpu_average_utilization_percent: number
  hpa_memory_average_utilization_percent: number
} {
  const settings = advancedSettings as Record<string, unknown> | undefined
  const cpuUtilization = settings?.['hpa.cpu.average_utilization_percent'] as number | undefined
  const memoryUtilization = settings?.['hpa.memory.average_utilization_percent'] as number | null | undefined

  return {
    hpa_metric_type: memoryUtilization != null ? 'CPU_AND_MEMORY' : 'CPU',
    hpa_cpu_average_utilization_percent: cpuUtilization ?? 60,
    hpa_memory_average_utilization_percent: (memoryUtilization as number) ?? 60,
  }
}

/**
 * Builds advanced settings update payload for HPA settings
 */
export function buildHpaAdvancedSettingsPayload(formData: Record<string, unknown>, currentAdvancedSettings: unknown) {
  const settings = currentAdvancedSettings as Record<string, unknown>
  const hpaSettings = {
    ...settings,
    'hpa.cpu.average_utilization_percent': Number(formData['hpa_cpu_average_utilization_percent']) || 60,
  } as Record<string, unknown>

  // Only include memory setting if metric type is CPU_AND_MEMORY
  if (formData['hpa_metric_type'] === 'CPU_AND_MEMORY') {
    hpaSettings['hpa.memory.average_utilization_percent'] =
      Number(formData['hpa_memory_average_utilization_percent']) || 60
  } else {
    hpaSettings['hpa.memory.average_utilization_percent'] = null
  }

  return hpaSettings
}
