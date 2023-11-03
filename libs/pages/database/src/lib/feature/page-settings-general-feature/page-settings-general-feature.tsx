import { useQueryClient } from '@tanstack/react-query'
import equal from 'fast-deep-equal'
import { DatabaseModeEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editDatabase, postDatabaseActionsRedeploy, selectDatabaseById } from '@qovery/domains/database'
import { useFetchDatabaseConfiguration, useFetchEnvironment } from '@qovery/domains/environment'
import { selectClusterById } from '@qovery/domains/organization'
import { type ClusterEntity, type DatabaseEntity } from '@qovery/shared/interfaces'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, database: DatabaseEntity) => {
  const cloneDatabase = Object.assign({}, database as DatabaseEntity)
  cloneDatabase.name = data['name']
  cloneDatabase.description = data['description']
  cloneDatabase.accessibility = data['accessibility']
  cloneDatabase.version = data['version']

  return cloneDatabase
}

export function PageSettingsGeneralFeature() {
  const { environmentId = '', projectId = '', databaseId = '' } = useParams()
  const queryClient = useQueryClient()
  const dispatch = useDispatch<AppDispatch>()

  const database = useSelector<RootState, DatabaseEntity | undefined>(
    (state) => selectDatabaseById(state, databaseId),
    equal
  )
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )
  const { data: databaseConfigurations, isLoading } = useFetchDatabaseConfiguration(projectId, environmentId)

  const databaseVersionOptions = databaseConfigurations
    ?.find((c) => c.database_type === database?.type)
    ?.version?.filter((v) => v.supported_mode === database?.mode)
    .map((v) => ({
      label: v.name || '',
      value: v.name || '',
    }))

  const publicOptionNotAvailable =
    cluster?.kubernetes === KubernetesEnum.K3_S && database?.mode === DatabaseModeEnum.CONTAINER

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

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
    if (data && database) {
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
        .catch((e) => {
          setLoading(false)
          console.error(e)
        })
    }
  })

  useEffect(() => {
    methods.reset({
      name: database?.name,
      description: database?.description,
      type: database?.type,
      mode: database?.mode,
      version: database?.version,
      accessibility: database?.accessibility,
    })
  }, [
    methods,
    database?.name,
    database?.description,
    database?.type,
    database?.mode,
    database?.version,
    database?.accessibility,
  ])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        onSubmit={onSubmit}
        loading={loading}
        publicOptionNotAvailable={publicOptionNotAvailable}
        databaseVersionLoading={isLoading}
        databaseVersionOptions={databaseVersionOptions}
        databaseMode={database?.mode}
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
