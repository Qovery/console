import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, postApplicationActionsRestart, selectApplicationById } from '@qovery/domains/application'
import { MemorySizeEnum, getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { convertCpuToVCpu } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (
  data: FieldValues,
  application: ApplicationEntity,
  memorySize: MemorySizeEnum | string
) => {
  const cloneApplication = Object.assign({}, application)
  const currentMemory = Number(data['memory'])

  cloneApplication.memory = memorySize === MemorySizeEnum.GB ? currentMemory * 1024 : currentMemory
  cloneApplication.cpu = convertCpuToVCpu(data['cpu'][0], true)
  cloneApplication.min_running_instances = data['instances'][0]
  cloneApplication.max_running_instances = data['instances'][1]

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

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: application?.memory,
      cpu: [convertCpuToVCpu(application?.cpu)],
      instances: [application?.min_running_instances || 1, application?.max_running_instances || 1],
    },
  })

  const [memorySize, setMemorySize] = useState<MemorySizeEnum | string>(MemorySizeEnum.MB)

  const getMemoryUnit = (value: string) => {
    setMemorySize(value)
    return value
  }

  useEffect(() => {
    methods.reset({
      memory: application?.memory,
      cpu: [convertCpuToVCpu(application?.cpu)],
      instances: [application?.min_running_instances || 1, application?.max_running_instances || 1],
    })
  }, [
    methods,
    application?.memory,
    application?.cpu,
    application?.min_running_instances,
    application?.max_running_instances,
  ])

  const toasterCallback = () => {
    dispatch(postApplicationActionsRestart({ applicationId, environmentId }))
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (!application) return

    setLoading(true)
    const cloneApplication = handleSubmit(data, application, memorySize)

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

  const displayWarningCpu: boolean = methods.watch('cpu')[0] > (application?.cpu || 0) / 1000

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={loading}
        application={application}
        memorySize={memorySize}
        getMemoryUnit={getMemoryUnit}
        displayWarningCpu={displayWarningCpu}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
