import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_GENERAL_URL, SERVICES_URL } from '@qovery/shared/router'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function PageApplicationCreateResourcesFeature() {
  const { setCurrentStep } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onBack = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)
  }

  return (
    <FunnelFlowBody>
      <h1>Welcome to PageApplicationCreateResourcesFeature!</h1>
      <button onClick={onBack}>Back</button>
    </FunnelFlowBody>
  )
}

export default PageApplicationCreateResourcesFeature
