import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
// import { editApplication } from '@console/domains/application'
import { selectDatabaseById } from '@console/domains/database'
import { MemorySizeEnum } from '@console/shared/enums'
import { DatabaseEntity } from '@console/shared/interfaces'
import { convertCpuToVCpu, convertMemory } from '@console/shared/utils'
import { RootState } from '@console/store/data'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, application: DatabaseEntity, memorySize: MemorySizeEnum) => {
  const cloneApplication = Object.assign({}, application)
  const currentMemory = Number(data['memory'])

  cloneApplication.memory = memorySize === MemorySizeEnum.GB ? currentMemory * 1024 : currentMemory
  cloneApplication.cpu = convertCpuToVCpu(data['cpu'][0], true)

  return cloneApplication
}

export function PageSettingsResourcesFeature() {
  const { databaseId = '' } = useParams()

  const [loading, setLoading] = useState(false)
  // const dispatch = useDispatch<AppDispatch>()

  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, databaseId))

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: database?.memory,
      cpu: [convertCpuToVCpu(database?.cpu)],
    },
  })

  const [memorySize, setMemorySize] = useState<MemorySizeEnum>(MemorySizeEnum.MB)

  useEffect(() => {
    methods.setValue('memory', database?.memory)
    methods.setValue('cpu', [convertCpuToVCpu(database?.cpu)])
  }, [methods, database?.memory, database?.cpu])

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
    if (!database) return

    setLoading(true)
    // const cloneDatabase = handleSubmit(data, database, memorySize)

    // dispatch(
    //   editApplication({
    //     applicationId: applicationId,
    //     data: cloneDatabase,
    //   })
    // )
    //   .unwrap()
    //   .then(() => setLoading(false))
    //   .catch(() => setLoading(false))
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={loading}
        database={database}
        memorySize={memorySize}
        handleChangeMemoryUnit={handleChangeMemoryUnit}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
