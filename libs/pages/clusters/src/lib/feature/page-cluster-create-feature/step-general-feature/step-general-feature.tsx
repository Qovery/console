import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchOrganizationContainerRegistries, selectOrganizationById } from '@qovery/domains/organization'
import { isContainer } from '@qovery/shared/enums'
import { ApplicationGeneralData, OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_APPLICATION_CREATION_URL, SERVICES_CREATION_RESOURCES_URL, SERVICES_URL } from '@qovery/shared/routes'
import { toastError } from '@qovery/shared/ui'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import StepGeneral from '../../../ui/page-application-create/step-general/step-general'
import { useApplicationContainerCreateContext } from '../page-application-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Application')
  const { setGeneralData, generalData, setCurrentStep } = useApplicationContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )
  const dispatch = useDispatch<AppDispatch>()
  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Application creation flow"
      items={[
        'You can deploy an application from a git repository or a container registry',
        'Git Repository: Qovery will pull the repository, build the application and deploy it on your kubernetes cluster',
        'Container Registry: Qovery will pull the image from container registry and deploy it on your kubernetes cluster',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#general',
            linkLabel: 'How to configure my application',
            external: true,
          },
          { link: 'https://discuss.qovery.com/', linkLabel: 'Still need help? Ask on our Forum', external: true },
        ],
      }}
    />
  )
  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<ApplicationGeneralData>({
    defaultValues: generalData,
    mode: 'onChange',
  })

  const watchServiceType = methods.watch('serviceType')

  useEffect(() => {
    if (isContainer(watchServiceType)) {
      dispatch(fetchOrganizationContainerRegistries({ organizationId }))
    }
  }, [watchServiceType, dispatch, organizationId])

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData = {
      ...data,
    }

    if (isContainer(data.serviceType) && data.cmd_arguments) {
      try {
        cloneData.cmd = eval(data.cmd_arguments)
      } catch (e: any) {
        toastError(e, 'Invalid CMD array')
        return
      }
    }
    setGeneralData(cloneData)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_APPLICATION_CREATION_URL}`
    navigate(pathCreate + SERVICES_CREATION_RESOURCES_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepGeneral organization={organization} onSubmit={onSubmit} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
