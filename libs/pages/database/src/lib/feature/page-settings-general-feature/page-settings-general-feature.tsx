import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editDatabase, selectDatabaseById } from '@qovery/domains/database'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, database: DatabaseEntity) => {
  const cloneDatabase = Object.assign({}, database as DatabaseEntity)
  cloneDatabase.name = data['name']
  cloneDatabase.description = data['description']
  cloneDatabase.accessibility = data['accessibility']

  return cloneDatabase
}

export function PageSettingsGeneralFeature() {
  const { databaseId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, databaseId))

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && database) {
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
      <PageSettingsGeneral onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
