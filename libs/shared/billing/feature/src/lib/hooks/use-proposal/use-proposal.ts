import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DismissProposalRequest, Proposals } from 'qovery-pricing-typescript-axios'
import { useEffect, useRef } from 'react'
import { BillingError, type PricingClient, billing } from '@qovery/shared/billing/data-access'

const proposalsStaleTime = 3000

export function useProposals(organizationId: string, client: PricingClient, enabled = true) {
  const query = useQuery({
    ...billing.proposals({ client, organizationId }),
    enabled: enabled && Boolean(client.proposals),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: proposalsStaleTime,
  })
  const accessDenied = query.error instanceof BillingError && [401, 403].includes(query.error.status)
  return {
    proposal: enabled && !accessDenied ? query.data?.proposal ?? null : null,
    error: enabled && Boolean(client.proposals) && query.isError && !query.isFetching,
    loading: enabled && Boolean(client.proposals) && (query.isLoading || (query.isFetching && !query.data)),
    refetch: query.refetch,
  }
}

export async function hideProposal(
  queryClient: QueryClient,
  organizationId: string,
  client: PricingClient,
  proposalId: number
) {
  const { queryKey } = billing.proposals({ client, organizationId })
  await queryClient.cancelQueries({ queryKey, exact: true })
  queryClient.setQueryData<Proposals>(queryKey, (current) =>
    !current || current.proposal?.id === proposalId ? { proposal: null } : current
  )
}

type ProposalAction = { proposalId: number; days: number } | { proposalId: number; request: DismissProposalRequest }

export function useProposal(organizationId: string, client: PricingClient, enabled = true) {
  const queryClient = useQueryClient()
  const query = useProposals(organizationId, client, enabled)
  const proposal = query.proposal
  const proposalId = proposal?.id
  const isPreview = proposal?.preview
  const viewed = useRef<{ organizationId: string; proposalId: number } | undefined>(undefined)
  useEffect(() => {
    if (proposalId === undefined || isPreview || !client.viewProposal) return
    if (viewed.current?.organizationId === organizationId && viewed.current.proposalId === proposalId) return
    viewed.current = { organizationId, proposalId }
    queryClient
      .fetchQuery({
        ...billing.proposalView({ client, organizationId, proposalId }),
        staleTime: proposalsStaleTime,
        retry: false,
      })
      .catch(() => undefined)
  }, [client, isPreview, organizationId, proposalId, queryClient])

  const mutation = useMutation({
    mutationFn: async (action: ProposalAction) => {
      if ('days' in action) await client.snoozeProposal?.(organizationId, action.proposalId, action.days)
      else await client.dismissProposal?.(organizationId, action.proposalId, action.request)
    },
    onMutate: () => ({ organizationId, client }),
    onSuccess: (_, action, source) => {
      if (source) return hideProposal(queryClient, source.organizationId, source.client, action.proposalId)
    },
  })

  return {
    proposal,
    error: mutation.error instanceof Error ? mutation.error.message : '',
    busy: mutation.isLoading,
    loading: query.loading,
    loadError: query.error,
    retry: () => query.refetch(),
    snooze: (days: number) => {
      if (proposal && !mutation.isLoading) mutation.mutate({ proposalId: proposal.id, days })
    },
    dismiss: (reason?: DismissProposalRequest['reason'], note?: string) => {
      if (!proposal || mutation.isLoading) return
      mutation.mutate({
        proposalId: proposal.id,
        request: { ...(reason ? { reason } : {}), ...(note ? { note } : {}) },
      })
    },
  }
}
