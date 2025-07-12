import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface Config {
  id: string
  title: string
  created_at: string
  updated_at: string
  organization_id: string
}

interface UseConfigReturn {
  enabled: boolean
  readOnly: boolean
  instructions: string
  isLoading: boolean
  error: string | null
  refetchConfig: () => Promise<void>
}

export const useConfig = ({ organizationId }: { organizationId: string }): UseConfigReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    ...queries.devopsCopilot.config({ organizationId }),
    enabled: !!organizationId,
  })

  return {
    enabled: data?.org_config?.enabled ?? false,
    readOnly: data?.org_config?.read_only ?? true,
    instructions: data?.org_config?.instructions ?? '',
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetchConfig: async () => {
      await refetch()
    },
  }
}
