import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseAdvancedSettingsProps {
  serviceId: string
  serviceType: Exclude<ServiceType, 'DATABASE'>
}

export function useAdvancedSettings({ serviceId, serviceType }: UseAdvancedSettingsProps) {
  return useQuery({
    ...queries.services.advancedSettings({
      serviceId,
      serviceType,
    }),
  })
}

export default useAdvancedSettings
