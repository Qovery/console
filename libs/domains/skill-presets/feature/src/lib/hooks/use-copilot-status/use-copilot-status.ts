import { useQuery } from '@tanstack/react-query'
import { getSkillPresetsMockScenario, installSkillPresetsCopilotMock } from '@qovery/domains/skill-presets/data-access'
import { useAICopilotConfig } from '@qovery/shared/devops-copilot/feature'

/**
 * In mock mode, the DevOps Copilot service calls go to the mock: wait until it is wired before the
 * Copilot queries run. Always ready outside mock mode.
 */
export function useCopilotMockReady() {
  const scenario = getSkillPresetsMockScenario()
  const { isSuccess } = useQuery({
    queryKey: ['skill-presets-copilot-mock', scenario],
    queryFn: () => installSkillPresetsCopilotMock(),
    enabled: scenario !== null,
    staleTime: Infinity,
  })
  return scenario === null || isSuccess
}

/** Whether the organization turned the Copilot on, and in which mode. Same query as the Copilot settings. */
export function useCopilotStatus({ organizationId }: { organizationId: string }) {
  const ready = useCopilotMockReady()
  const { data, isLoading, error } = useAICopilotConfig({ organizationId, enabled: ready })
  return {
    ready,
    enabled: data?.org_config?.enabled ?? false,
    readOnly: data?.org_config?.read_only ?? true,
    isLoading: !ready || isLoading,
    error,
  }
}
