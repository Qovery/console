import { useQuery } from '@tanstack/react-query'
import { type AdvancedSettingsServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDefaultAdvancedSettingsProps {
  serviceType: AdvancedSettingsServiceType
  enabled?: boolean
  suspense?: boolean
}

export function useDefaultAdvancedSettings({
  serviceType,
  enabled = true,
  suspense = false,
}: UseDefaultAdvancedSettingsProps) {
  return useQuery({
    ...queries.services.defaultAdvancedSettings({
      serviceType,
    }),
    enabled,
    suspense,
  })
}

export default useDefaultAdvancedSettings
