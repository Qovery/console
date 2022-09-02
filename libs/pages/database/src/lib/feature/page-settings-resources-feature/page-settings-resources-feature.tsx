import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editDatabase, selectDatabaseById } from '@console/domains/database'
import { MemorySizeEnum } from '@console/shared/enums'
import { DatabaseEntity } from '@console/shared/interfaces'
import { convertCpuToVCpu } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (
  data: FieldValues,
  database: DatabaseEntity,
  memorySize: MemorySizeEnum | string,
  storageSize: MemorySizeEnum | string
) => {
  const cloneDatabase = Object.assign({}, database)
  const currentMemory = Number(data['memory'])
  const currentStorage = Number(data['storage'])

  cloneDatabase.cpu = convertCpuToVCpu(data['cpu'][0], true)
  cloneDatabase.memory = memorySize === MemorySizeEnum.GB ? currentMemory * 1024 : currentMemory
  cloneDatabase.storage = storageSize === MemorySizeEnum.GB ? currentStorage * 1024 : currentStorage

  return cloneDatabase
}

export function PageSettingsResourcesFeature() {
  const { databaseId = '' } = useParams()

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, databaseId))

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: database?.memory,
      storage: database?.storage,
      cpu: [convertCpuToVCpu(database?.cpu)],
    },
  })

  const [memorySize, setMemorySize] = useState<MemorySizeEnum | string>(MemorySizeEnum.MB)
  const [storageSize, setStorageSize] = useState<MemorySizeEnum | string>(MemorySizeEnum.MB)

  useEffect(() => {
    methods.reset({
      memory: database?.memory,
      storage: database?.storage,
      cpu: [convertCpuToVCpu(database?.cpu)],
    })
  }, [methods, database?.memory, database?.storage, database?.cpu])

  const onSubmit = methods.handleSubmit((data) => {
    if (!database) return

    setLoading(true)
    const cloneDatabase = handleSubmit(data, database, memorySize, storageSize)

    dispatch(
      editDatabase({
        databaseId: databaseId,
        data: cloneDatabase,
      })
    )
      .unwrap()
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  })

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={loading}
        database={database}
        memorySize={memorySize}
        setMemorySize={setMemorySize}
        setStorageSize={setStorageSize}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
