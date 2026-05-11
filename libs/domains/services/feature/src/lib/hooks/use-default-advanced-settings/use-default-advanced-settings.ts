import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDefaultAdvancedSettingsProps {
  serviceType: Exclude<ServiceType, 'DATABASE'>
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
