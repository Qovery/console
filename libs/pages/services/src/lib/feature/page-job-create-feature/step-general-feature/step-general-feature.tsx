import { BuildModeEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchOrganizationContainerRegistries, selectOrganizationById } from '@qovery/domains/organization'
import { ServiceTypeEnum, isContainer } from '@qovery/shared/enums'
import { JobGeneralData, OrganizationEntity } from '@qovery/shared/interfaces'
import { SERVICES_JOB_CREATION_CONFIGURE_URL, SERVICES_URL } from '@qovery/shared/routes'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import StepGeneral from '../../../ui/page-job-create/step-general/step-general'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepGeneralFeature() {
  useDocumentTitle('General - Create Job')
  const { setGeneralData, generalData, setCurrentStep, jobURL, jobType } = useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title={`${jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job creation`}
      items={[
        'You can deploy an application from a git repository or a container registry',
        'Git Repository: Qovery will pull the repository, build the application and deploy it on your kubernetes cluster',
        'Container Registry: Qovery will pull the image from container registry and deploy it on your kubernetes cluster',
      ]}
    />
  )

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const methods = useForm<JobGeneralData>({
    defaultValues: generalData,
    mode: 'onChange',
  })

  const dispatch = useDispatch<AppDispatch>()
  const watchServiceType = methods.watch('serviceType')

  useEffect(() => {
    methods.setValue('build_mode', BuildModeEnum.DOCKER)
  }, [methods])

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
        <StepGeneral organization={organization} onSubmit={onSubmit} jobType={jobType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepGeneralFeature
