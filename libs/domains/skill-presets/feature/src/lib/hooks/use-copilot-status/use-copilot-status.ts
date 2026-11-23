import { useAICopilotConfig } from '@qovery/shared/devops-copilot/feature'

/** Whether the organization turned the Copilot on, and in which mode. Same query as the Copilot settings. */
export function useCopilotStatus({ organizationId }: { organizationId: string }) {
  const { data, isLoading, error, refetch } = useAICopilotConfig({ organizationId })
  return {
    enabled: data?.org_config?.enabled ?? false,
    readOnly: data?.org_config?.read_only ?? true,
    hasConfig: Boolean(data?.org_config),
    isLoading,
    error,
    refetch,
  }
}
