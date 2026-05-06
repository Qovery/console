import { createFileRoute, useParams } from '@tanstack/react-router'
import { type ClusterDnsProviderRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import {
  ClusterDnsProviderSettings,
  canEditDnsProvider,
  isForbiddenError,
  useClusterDnsProvider,
  useEditClusterDnsProvider,
} from '@qovery/domains/clusters/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { LoaderSpinner, toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/dns-provider'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('DNS provider - Cluster settings')

  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const [submitError, setSubmitError] = useState<string>()
  const { data: organization, isLoading: isOrganizationLoading } = useOrganization({ organizationId })
  const { data: clusterDnsProvider, isLoading: isClusterDnsProviderLoading } = useClusterDnsProvider({ clusterId })
  const { mutateAsync: editClusterDnsProvider, isLoading: isEditClusterDnsProviderLoading } =
    useEditClusterDnsProvider()

  const isLoading = isOrganizationLoading || isClusterDnsProviderLoading
  const isEditable = canEditDnsProvider(organization?.plan)

  const onSubmit = async (clusterDnsProviderRequest: ClusterDnsProviderRequest) => {
    setSubmitError(undefined)

    try {
      return await editClusterDnsProvider({
        clusterId,
        clusterDnsProviderRequest,
      })
    } catch (error) {
      if (isForbiddenError(error)) {
        const message = 'Changing the DNS provider requires a Business or Enterprise plan.'
        setSubmitError(message)
        toast('error', 'DNS provider update blocked', message)
      } else {
        toast('error', 'Unable to update DNS provider')
      }

      return undefined
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoaderSpinner className="w-4" />
      </div>
    )
  }

  return (
    <ClusterDnsProviderSettings
      key={JSON.stringify(clusterDnsProvider?.dns_provider)}
      organizationId={organizationId}
      clusterDnsProvider={clusterDnsProvider}
      disabled={!isEditable}
      submitError={submitError}
      isSubmitting={isEditClusterDnsProviderLoading}
      onSubmit={onSubmit}
    />
  )
}
