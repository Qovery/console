import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export function useDefaultAdvancedSettings() {
  return useQuery({
    ...queries.clusters.defaultAdvancedSettings,
  })
}

export default useDefaultAdvancedSettings
