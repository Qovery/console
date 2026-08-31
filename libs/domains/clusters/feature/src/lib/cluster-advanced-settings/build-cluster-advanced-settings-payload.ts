import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { objectFlattener } from '@qovery/shared/util-js'

function normalizeClusterAdvancedSettingValue(value: unknown, defaultValue: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      if (value === '') {
        return typeof defaultValue === 'object' ? defaultValue : defaultValue ?? ''
      }
    }
  }

  return value
}

export function normalizeClusterAdvancedSettings(
  advancedSettings: ClusterAdvancedSettings | Record<string, unknown>,
  defaultAdvancedSettings?: ClusterAdvancedSettings
): ClusterAdvancedSettings {
  return Object.fromEntries(
    Object.entries(advancedSettings).map(([key, value]) => [
      key,
      normalizeClusterAdvancedSettingValue(value, defaultAdvancedSettings?.[key as keyof ClusterAdvancedSettings]),
    ])
  ) as ClusterAdvancedSettings
}

export function buildClusterAdvancedSettingsPayload(
  data: Record<string, unknown>,
  defaultAdvancedSettings?: ClusterAdvancedSettings
): ClusterAdvancedSettings {
  const flatData = Object.fromEntries(Object.entries(data).filter(([key]) => key.includes('.')))
  const nestedData = Object.fromEntries(Object.entries(data).filter(([key]) => !key.includes('.')))
  const dataFormatted = {
    ...flatData,
    ...objectFlattener(nestedData),
  }

  return normalizeClusterAdvancedSettings(dataFormatted, defaultAdvancedSettings)
}
