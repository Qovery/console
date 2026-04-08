import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { StepAddons, useMaybeClusterContainerCreateContext } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/addons')({
  component: Addons,
})

function Addons() {
  useDocumentTitle('Add-ons - Create Cluster')
  const { organizationId = '', slug } = useParams({ strict: false })
  const navigate = useNavigate()
  const createContext = useMaybeClusterContainerCreateContext()
  const generalData = createContext?.generalData

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`
  const isAllowed =
    generalData?.installation_type === 'MANAGED' &&
    (generalData?.cloud_provider === 'AWS' || generalData?.cloud_provider === 'GCP')
  const shouldRedirect = Boolean(generalData) && !isAllowed

  useEffect(() => {
    if (shouldRedirect) {
      navigate({ to: `${creationFlowUrl}/summary` })
    }
  }, [creationFlowUrl, navigate, shouldRedirect])

  if (shouldRedirect) {
    return null
  }

  if (!createContext) {
    return null
  }

  const handleSubmit = () => {
    navigate({ to: `${creationFlowUrl}/summary` })
  }

  return <StepAddons organizationId={organizationId} onSubmit={handleSubmit} />
}
