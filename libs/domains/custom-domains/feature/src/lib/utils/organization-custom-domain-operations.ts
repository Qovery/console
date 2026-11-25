import { type QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

type CustomDomainServiceType = Parameters<typeof mutations.editCustomDomain>[0]['serviceType']

// An organization domain is stored once per service it serves: each target is one of those copies.
export interface OrganizationCustomDomainTarget {
  serviceId: string
  serviceType: CustomDomainServiceType
  customDomainId: string
}

const getErrorReason = (error: unknown) => {
  if (isAxiosError<{ message?: string; detail?: string }>(error))
    return error.response?.data?.message || error.response?.data?.detail || error.message
  return error instanceof Error ? error.message : ''
}

// A copy that is already gone counts as deleted, so retrying after a partial failure does not fail on it.
export async function deleteOrganizationCustomDomainCopy(target: OrganizationCustomDomainTarget) {
  try {
    await mutations.deleteCustomDomain(target)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return
    throw error
  }
}

// Runs every operation, then fails with a count if any failed. Successful operations stay applied.
export async function settleOrganizationCustomDomainOperations(
  operations: (() => Promise<unknown>)[],
  describeFailure: (failedCount: number, totalCount: number) => string
) {
  const results = await Promise.allSettled(operations.map((operation) => operation()))
  const failures = results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []))
  if (!failures.length) return
  const reason = getErrorReason(failures[0])
  throw new Error([describeFailure(failures.length, operations.length), reason].filter(Boolean).join(' '))
}

export function invalidateOrganizationCustomDomainTargets(
  queryClient: QueryClient,
  targets: OrganizationCustomDomainTarget[]
) {
  queryClient.invalidateQueries({ queryKey: queries.customDomains.organizationList._def })
  targets.forEach(({ serviceId, serviceType }) => {
    queryClient.invalidateQueries({ queryKey: queries.services.customDomains({ serviceId, serviceType }).queryKey })
    queryClient.invalidateQueries({ queryKey: queries.services.listLinks({ serviceId, serviceType }).queryKey })
  })
}
