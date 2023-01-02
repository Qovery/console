import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, postApplicationActionsRestart, selectApplicationById } from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { selectClusterById } from '@qovery/domains/organization'
import { getServiceType, isJob } from '@qovery/shared/enums'
import { ApplicationEntity, ClusterEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
import { convertCpuToVCpu } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity) => {
  const cloneApplication = Object.assign({}, application)

  cloneApplication.memory = Number(data['memory'])
  cloneApplication.cpu = convertCpuToVCpu(data['cpu'][0], true)
  if (!isJob(application)) {
    cloneApplication.min_running_instances = data['instances'][0]
    cloneApplication.max_running_instances = data['instances'][1]
  }

  return cloneApplication
}

export function PageSettingsResourcesFeature() {
  const { applicationId = '', environmentId = '' } = useParams()

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) =>
      a?.memory === b?.memory &&
      a?.cpu === b?.cpu &&
      a?.min_running_instances === b?.min_running_instances &&
      a?.max_running_instances === b?.max_running_instances &&
      JSON.stringify(a?.instances) === JSON.stringify(b?.instances)
  )

  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: application?.memory,
      cpu: [convertCpuToVCpu(application?.cpu)],
      instances: [application?.min_running_instances || 1, application?.max_running_instances || 1],
    },
  })

  useEffect(() => {
    methods.reset({
      memory: application?.memory,
      cpu: [convertCpuToVCpu(application?.cpu)],
      instances: [application?.min_running_instances || 1, application?.max_running_instances || 1],
    })
  }, [methods, application?.memory, application?.cpu, application])

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRestart({ applicationId, environmentId, serviceType: getServiceType(application) })
      )
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (!application) return

    setLoading(true)
    const cloneApplication = handleSubmit(data, application)

    dispatch(
      editApplication({
        applicationId: applicationId,
        data: cloneApplication,
        serviceType: getServiceType(application),
        toasterCallback,
      })
    )
      .unwrap()
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  })

  const displayWarningCpu: boolean = methods.watch('cpu')[0] > (cluster?.cpu || 0) / 1000

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={loading}
        application={application}
        displayWarningCpu={displayWarningCpu}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
