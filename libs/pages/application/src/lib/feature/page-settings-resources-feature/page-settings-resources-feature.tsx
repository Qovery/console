import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationById } from '@console/domains/application'
import { MemorySizeEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import { convertCpuToVCpu, convertMemory } from '@console/shared/utils'
// import { convertMemory } from '@console/shared/utils'
import { RootState } from '@console/store/data'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export function PageSettingsResourcesFeature() {
  const { applicationId = '' } = useParams()

  const [loading, setLoading] = useState(false)
  // const dispatch = useDispatch<AppDispatch>()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => a?.id === b?.id
  )

  const methods = useForm({
    mode: 'onChange',
  })

  const [memorySize, setMemorySize] = useState<MemorySizeEnum>(MemorySizeEnum.MB)

  const watchMemory = methods.watch('memory')

  useEffect(() => {
    if (application) {
      methods.setValue('memory', application?.memory)
      methods.setValue('cpu', [convertCpuToVCpu(application?.cpu)])
      methods.setValue('instances', [application?.min_running_instances, application?.max_running_instances])
    }
  }, [application, methods])

  const handleChangeMemoryUnit = () => {
    const newMemorySize = memorySize === MemorySizeEnum.MB ? MemorySizeEnum.GB : MemorySizeEnum.MB
    setMemorySize(newMemorySize)
    if (newMemorySize === MemorySizeEnum.GB) {
      methods.setValue('memory', convertMemory(watchMemory, MemorySizeEnum.MB))
    } else {
      methods.setValue('memory', convertMemory(watchMemory, MemorySizeEnum.GB))
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)
    // memory (size) MB by default
    console.log(data)
    console.log(application)
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={loading}
        application={application}
        memory={application?.memory}
        memorySize={memorySize}
        handleChangeMemoryUnit={handleChangeMemoryUnit}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
