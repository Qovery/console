import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { type ClusterDnsProviderRequest } from 'qovery-typescript-axios'
import { Suspense, useState } from 'react'
import {
  ClusterDnsProviderSettings,
  canEditDnsProvider,
  useCluster,
  useClusterDnsProvider,
  useEditClusterDnsProvider,
  useIsOperatorAttached,
} from '@qovery/domains/clusters/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { LoaderSpinner, toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { isForbiddenError } from '@qovery/shared/util-js'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/dns-provider'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('DNS provider - Cluster settings')
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const isOperatorAttached = useIsOperatorAttached(cluster)

  const loader = (
    <div className="flex justify-center p-8">
      <LoaderSpinner className="w-4" />
    </div>
  )

  if (isClusterLoading || (cluster && isOperatorAttached === undefined)) {
    return loader
  }

  if (isOperatorAttached) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/$clusterId/settings/general"
        params={{ organizationId, clusterId }}
        replace
      />
    )
  }

  return (
    <Suspense fallback={loader}>
      <ClusterDnsProviderSettingsFeature />
    </Suspense>
  )
}

function ClusterDnsProviderSettingsFeature() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const [submitError, setSubmitError] = useState<string>()
  const { data: organization } = useOrganization({ organizationId, suspense: true })
  const { data: clusterDnsProvider } = useClusterDnsProvider({ clusterId, suspense: true })
  const { mutateAsync: editClusterDnsProvider, isLoading: isEditClusterDnsProviderLoading } =
    useEditClusterDnsProvider()

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
        const message = 'Changing the DNS provider requires a Scale, Business or Enterprise plan.'
        setSubmitError(message)
        toast('error', 'DNS provider update blocked', message)
      } else {
        toast('error', 'Unable to update DNS provider')
      }

      return undefined
    }
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
