import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_DOCKERFILE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { FunnelFlowBody, toastError } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import StepConfigure from '../../../ui/page-job-create/step-configure/step-configure'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepConfigureFeature() {
  useDocumentTitle('Configure - Create Job')
  const { configureData, setConfigureData, setCurrentStep, generalData, dockerfileForm, jobURL, jobType } =
    useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    !generalData?.name &&
      jobURL &&
      navigate(`${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}` + SERVICES_JOB_CREATION_GENERAL_URL)
  }, [generalData, navigate, environmentId, organizationId, projectId, jobURL])

  useEffect(() => {
    setCurrentStep(2)

    if (configureData?.nb_restarts === undefined) {
      methods.setValue('nb_restarts', 0)
    }

    if (configureData?.max_duration === undefined) {
      methods.setValue('max_duration', 300)
    }
  }, [setCurrentStep])

  const methods = useForm<JobConfigureData>({
    defaultValues: configureData,
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    const cloneData: JobConfigureData = {
      ...data,
    }

    if (jobType === ServiceTypeEnum.LIFECYCLE_JOB) {
      if (cloneData.on_start?.enabled && cloneData.on_start?.arguments_string) {
        try {
          cloneData.on_start.arguments = eval(cloneData.on_start.arguments_string)
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid CMD array')
          return
        }
      }

      if (cloneData.on_stop?.enabled && cloneData.on_stop?.arguments_string) {
        try {
          cloneData.on_stop.arguments = eval(cloneData.on_stop.arguments_string)
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid CMD array')
          return
        }
      }

      if (cloneData.on_delete?.enabled && cloneData.on_delete?.arguments_string) {
        try {
          cloneData.on_delete.arguments = eval(cloneData.on_delete.arguments_string)
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid CMD array')
          return
        }
      }
    }

    setConfigureData(cloneData)
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    navigate(pathCreate + SERVICES_JOB_CREATION_RESOURCES_URL)
  })

  const onBack = () => {
    const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${jobURL}`
    if (dockerfileForm.getValues('dockerfile_path') || dockerfileForm.getValues('dockerfile_raw')) {
      navigate(pathCreate + SERVICES_JOB_CREATION_DOCKERFILE_URL)
    } else {
      navigate(pathCreate + SERVICES_JOB_CREATION_GENERAL_URL)
    }
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <StepConfigure onSubmit={onSubmit} onBack={onBack} jobType={jobType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepConfigureFeature
