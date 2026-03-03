import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseAdvancedSettingsProps {
  serviceId: string
  serviceType: Exclude<ServiceType, 'DATABASE'>
  enabled?: boolean
  suspense?: boolean
}

export function useAdvancedSettings({
  serviceId,
  serviceType,
  enabled = true,
  suspense = false,
}: UseAdvancedSettingsProps) {
  return useQuery({
    ...queries.services.advancedSettings({
      serviceId,
      serviceType,
    }),
    enabled,
    suspense,
  })
}

export default useAdvancedSettings
