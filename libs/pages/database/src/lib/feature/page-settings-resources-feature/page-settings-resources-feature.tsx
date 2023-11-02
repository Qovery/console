import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editDatabase, postDatabaseActionsRedeploy, selectDatabaseById } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { type DatabaseEntity } from '@qovery/shared/interfaces'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export const handleSubmit = (data: FieldValues, database: DatabaseEntity) => {
  const cloneDatabase = Object.assign({}, database)

  cloneDatabase.cpu = data['cpu']
  cloneDatabase.memory = Number(data['memory'])
  cloneDatabase.storage = Number(data['storage'])
  cloneDatabase.instance_type = data['instance_type']

  return cloneDatabase
}

export function PageSettingsResourcesFeature() {
  const { databaseId = '', environmentId = '', projectId = '' } = useParams()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, databaseId))
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: database?.memory,
      storage: database?.storage,
      cpu: database?.cpu || 10,
      instance_type: database?.instance_type,
    },
  })

  useEffect(() => {
    methods.reset({
      memory: database?.memory,
      storage: database?.storage,
      cpu: database?.cpu || 10,
      instance_type: database?.instance_type,
    })
  }, [methods, database?.memory, database?.storage, database?.cpu, database?.instance_type])

  const toasterCallback = () => {
    if (database) {
      dispatch(
        postDatabaseActionsRedeploy({
          databaseId,
          environmentId,
          queryClient,
        })
      )
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (!database) return

    setLoading(true)
    const cloneDatabase = handleSubmit(data, database)

    dispatch(
      editDatabase({
        databaseId: databaseId,
        data: cloneDatabase,
        toasterCallback,
        queryClient,
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
        clusterId={environment?.cluster_id}
      />
    </FormProvider>
  )
}

export default PageSettingsResourcesFeature
