import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editDatabase, selectDatabaseById } from '@qovery/domains/database'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { convertCpuToVCpu } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, database: DatabaseEntity) => {
  const cloneDatabase = Object.assign({}, database)

  cloneDatabase.cpu = convertCpuToVCpu(data['cpu'][0], true)
  cloneDatabase.memory = Number(data['memory'])
  cloneDatabase.storage = Number(data['storage'])

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
      cpu: [convertCpuToVCpu(database?.cpu) || 1],
    },
  })

  useEffect(() => {
    methods.reset({
      memory: database?.memory,
      storage: database?.storage,
      cpu: [convertCpuToVCpu(database?.cpu) || 1],
    })
  }, [methods, database?.memory, database?.storage, database?.cpu])

  const onSubmit = methods.handleSubmit((data) => {
    if (!database) return

    setLoading(true)
    const cloneDatabase = handleSubmit(data, database)

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
      <PageSettingsResources onSubmit={onSubmit} loading={loading} database={database} />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
