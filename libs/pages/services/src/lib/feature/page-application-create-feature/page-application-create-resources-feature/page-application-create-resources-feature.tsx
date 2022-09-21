import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import {
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import PageApplicationCreateResources from '../../../ui/page-application-create/page-application-create-resources/page-application-create-resources'
import { ResourcesData } from '../application-creation-flow.interface'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function PageApplicationCreateResourcesFeature() {
  const { setCurrentStep, resourcesData, setResourcesData } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Step 2 is even better"
      items={['because it smells super good', 'and we do it with love and passion']}
      helpSectionProps={{
        description: 'This is a description',
        links: [{ link: '#', linkLabel: 'link', external: true }],
      }}
    />
  )

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const methods = useForm<ResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  const onBack = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <PageApplicationCreateResources onBack={onBack} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default PageApplicationCreateResourcesFeature
