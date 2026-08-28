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
  const dataWithoutFlatKeys = { ...data }

  Object.keys(dataWithoutFlatKeys).forEach((key) => {
    if (key.includes('.')) {
      delete dataWithoutFlatKeys[key]
    }
  })

  const dataFormatted = objectFlattener(dataWithoutFlatKeys)

  return normalizeClusterAdvancedSettings(dataFormatted, defaultAdvancedSettings)
}
