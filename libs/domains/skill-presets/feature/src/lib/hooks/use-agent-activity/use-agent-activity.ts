import { useQuery } from '@tanstack/react-query'
import { type AgentActivityParams } from '@qovery/domains/skill-presets/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseAgentActivityProps extends AgentActivityParams {
  organizationId: string
  /** organization: everyone (owners and admins). me: the caller's own activity only. */
  scope: 'organization' | 'me'
  enabled?: boolean
}

export function useAgentActivity({ organizationId, scope, enabled = true, userSub, ...params }: UseAgentActivityProps) {
  const isOrganization = scope === 'organization'
  const organization = useQuery({
    ...queries.skillPresets.agentActivity({ organizationId, ...params, userSub }),
    enabled: enabled && Boolean(organizationId) && isOrganization,
    retry: false,
  })
  const own = useQuery({
    ...queries.skillPresets.myAgentActivity({ organizationId, ...params }),
    enabled: enabled && Boolean(organizationId) && !isOrganization,
    retry: false,
  })
  return isOrganization ? organization : own
}
