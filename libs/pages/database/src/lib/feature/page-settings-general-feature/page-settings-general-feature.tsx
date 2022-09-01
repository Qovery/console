import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editDatabase, selectDatabaseById } from '@console/domains/database'
import { DatabaseEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, database: DatabaseEntity) => {
  const cloneDatabase = Object.assign({}, database as DatabaseEntity)
  cloneDatabase.name = data['name']
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
    methods.setValue('name', database?.name)
    methods.setValue('type', database?.type)
    methods.setValue('mode', database?.mode)
    methods.setValue('version', database?.version)
    methods.setValue('accessibility', database?.accessibility)
  }, [methods, database?.name, database?.type, database?.mode, database?.version, database?.accessibility])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
