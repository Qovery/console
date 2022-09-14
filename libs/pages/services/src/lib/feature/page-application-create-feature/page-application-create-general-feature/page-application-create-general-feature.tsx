import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_RESOURCES_URL, SERVICES_URL } from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import PageApplicationCreateGeneral from '../../../ui/page-application-create/page-application-create-general/page-application-create-general'
import { GlobalData } from '../interfaces.interface'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function PageApplicationCreateGeneralFeature() {
  const { setGlobalData, globalData, setCurrentStep } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Step 1 is cool"
      items={['because it smells good', 'and we do it with love']}
      helpSectionProps={{
        description: 'This is a description',
        links: [{ link: '#', linkLabel: 'link', external: true }],
      }}
    />
  )
  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<GlobalData>({
    defaultValues: globalData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setGlobalData(data)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <PageApplicationCreateGeneral onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default PageApplicationCreateGeneralFeature
