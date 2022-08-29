import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, selectApplicationById } from '@console/domains/application'
import { MemorySizeEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import { convertCpuToVCpu, convertMemory } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity, memorySize: MemorySizeEnum) => {
  const cloneApplication = Object.assign({}, application)
  const currentMemory = Number(data['memory'])

  cloneApplication.memory = memorySize === MemorySizeEnum.GB ? currentMemory * 1024 : currentMemory
  cloneApplication.cpu = convertCpuToVCpu(data['cpu'][0], true)
  cloneApplication.min_running_instances = data['instances'][0]
  cloneApplication.max_running_instances = data['instances'][1]

  return cloneApplication
}

export function PageSettingsResourcesFeature() {
  const { applicationId = '' } = useParams()

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
      instances: [application?.min_running_instances || 0, application?.max_running_instances || 1],
    },
  })

  const [memorySize, setMemorySize] = useState<MemorySizeEnum>(MemorySizeEnum.MB)

  useEffect(() => {
    if (application) {
      methods.setValue('memory', application?.memory)
      methods.setValue('cpu', [convertCpuToVCpu(application?.cpu)])
      methods.setValue('instances', [application?.min_running_instances || 1, application?.max_running_instances || 1])
    }
  }, [application, methods])

  const handleChangeMemoryUnit = () => {
    const watchMemory = methods.watch('memory')
    const newMemorySize = memorySize === MemorySizeEnum.MB ? MemorySizeEnum.GB : MemorySizeEnum.MB
    setMemorySize(newMemorySize)

    if (newMemorySize === MemorySizeEnum.GB) {
      const newMemory = convertMemory(Number(watchMemory), MemorySizeEnum.MB)
      methods.setValue('memory', newMemory)
    } else {
      const newMemory = convertMemory(Number(watchMemory), MemorySizeEnum.GB)
      methods.setValue('memory', newMemory)
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (!application) return

    setLoading(true)
    const cloneApplication = handleSubmit(data, application, memorySize)

    dispatch(
      editApplication({
        applicationId: applicationId,
        data: cloneApplication,
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
        handleChangeMemoryUnit={handleChangeMemoryUnit}
        displayWarningCpu={displayWarningCpu}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
