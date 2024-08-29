import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { type ApplicationResourcesData } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepResources from '../../../ui/page-job-create/step-resources/step-resources'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepResourcesFeature() {
  useDocumentTitle('Resources - Create Job')
  const { setCurrentStep, resourcesData, setResourcesData, generalData, jobURL, templateType } =
    useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, jobURL, projectId])

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const methods = useForm<ApplicationResourcesData>({
    defaultValues: resourcesData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    setResourcesData(data)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_VARIABLE_URL)
  })

  const onBack = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_CONFIGURE_URL)
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepResources onBack={onBack} onSubmit={onSubmit} templateType={templateType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepResourcesFeature
