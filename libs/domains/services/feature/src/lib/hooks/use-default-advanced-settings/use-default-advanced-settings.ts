import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDefaultAdvancedSettingsProps {
  serviceType: Exclude<ServiceType, 'DATABASE'>
}

export function useDefaultAdvancedSettings({ serviceType }: UseDefaultAdvancedSettingsProps) {
  return useQuery({
    ...queries.services.defaultAdvancedSettings({
      serviceType,
    }),
  })
}

export default useDefaultAdvancedSettings
