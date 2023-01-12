import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { JobConfigureData } from '@qovery/shared/interfaces'
import {
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { toastError } from '@qovery/shared/ui'
import { FunnelFlowBody, FunnelFlowHelpCard } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import StepConfigure from '../../../ui/page-job-create/step-configure/step-configure'
import { useJobContainerCreateContext } from '../page-job-create-feature'

export function StepConfigureFeature() {
  useDocumentTitle('Configure - Create Job')
  const { configureData, setConfigureData, setCurrentStep, generalData, jobURL, jobType } =
    useJobContainerCreateContext()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title={`${jobType === ServiceTypeEnum.CRON_JOB ? 'Cron' : 'Lifecycle'} job Information`}
      items={[
        'Define if the job shall be triggered when the environment Starts, Stops or is being deleted',
        'You can customize the job behaviour by defining an entrypoint and arguments to be used at running time',
        'For long running job it is recommended to properly set the max duration and a port to test the job liveness',
      ]}
    />
  )

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

    if (jobType === ServiceTypeEnum.CRON_JOB) {
      if (data.cmd_arguments) {
        try {
          cloneData.cmd = eval(data.cmd_arguments)
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
          return
        }
      }
    }

    if (jobType === ServiceTypeEnum.LIFECYCLE_JOB) {
      if (cloneData.on_start?.enabled && cloneData.on_start?.arguments_string) {
        try {
          cloneData.on_start.arguments = eval(cloneData.on_start.arguments_string)
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
          return
        }
      }

      if (cloneData.on_stop?.enabled && cloneData.on_stop?.arguments_string) {
        try {
          cloneData.on_stop.arguments = eval(cloneData.on_stop.arguments_string)
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
          return
        }
      }

      if (cloneData.on_delete?.enabled && cloneData.on_delete?.arguments_string) {
        try {
          cloneData.on_delete.arguments = eval(cloneData.on_delete.arguments_string)
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
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
    navigate(pathCreate + SERVICES_JOB_CREATION_GENERAL_URL)
  }

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...methods}>
        <StepConfigure onSubmit={onSubmit} onBack={onBack} jobType={jobType} />
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepConfigureFeature
