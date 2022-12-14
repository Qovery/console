import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchOrganizationContainerRegistries, selectOrganizationById } from '@qovery/domains/organization'
import { isContainer } from '@qovery/shared/enums'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_JOB_CREATION_CONFIGURE_URL, SERVICES_URL } from '@qovery/shared/router'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import General from '../../../ui/page-job-create/general/general'
import { GeneralData } from '../job-creation-flow.interface'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function GeneralFeature() {
  useDocumentTitle('General - Create Job')
  const { setGeneralData, generalData, setCurrentStep, jobURL, jobType } = useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Cronjob creation"
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

  const methods = useForm<GeneralData>({
    defaultValues: generalData,
    mode: 'onChange',
  })

  const dispatch = useDispatch<AppDispatch>()
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

    setGeneralData(cloneData)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
  })

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <General organization={organization} onSubmit={onSubmit} jobType={jobType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default GeneralFeature
