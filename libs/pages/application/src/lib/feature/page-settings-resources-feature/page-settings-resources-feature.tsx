import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { editApplication, postApplicationActionsRedeploy, selectApplicationById } from '@qovery/domains/application'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { getServiceType, isJob } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity) => {
  const cloneApplication = Object.assign({}, application)

  cloneApplication.memory = Number(data['memory'])
  cloneApplication.cpu = data['cpu']
  if (!isJob(application)) {
    cloneApplication.min_running_instances = data['instances'][0]
    cloneApplication.max_running_instances = data['instances'][1]
  }

  return cloneApplication
}

export function PageSettingsResourcesFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) =>
      a?.memory === b?.memory &&
      a?.cpu === b?.cpu &&
      a?.min_running_instances === b?.min_running_instances &&
      a?.max_running_instances === b?.max_running_instances &&
      JSON.stringify(a?.instances) === JSON.stringify(b?.instances)
  )

  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: application?.memory,
      cpu: application?.cpu,
      instances: [application?.min_running_instances || 1, application?.max_running_instances || 1],
    },
  })

  useEffect(() => {
    methods.reset({
      memory: application?.memory,
      cpu: application?.cpu,
      instances: [application?.min_running_instances || 1, application?.max_running_instances || 1],
    })
  }, [methods, application?.memory, application?.cpu, application])

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRedeploy({
          applicationId,
          environmentId,
          serviceType: getServiceType(application),
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
            ),
        })
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

  const displayWarningCpu: boolean = (methods.watch('cpu') || 0) > (application?.maximum_cpu || 0)

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={loading}
        application={application}
        displayWarningCpu={displayWarningCpu}
        clusterId={environment?.cluster_id}
        environmentMode={environment?.mode}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
