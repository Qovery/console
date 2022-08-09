import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { addStorage, initStorage, onRemove } from './utils/utils'
import { ApplicationEntity, LoadingStatus } from '@console/shared/interfaces'
import { fetchApplication, selectApplicationById } from '@console/domains/application'
import PageSettingsStorage from '../../ui/page-settings-storage/page-settings-storage'

export function PageSettingsStorageFeature() {
  const { applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({ defaultValues: {}, mode: 'all' })

  const [keys, setKeys] = useState<string[]>([])

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => state.entities.applications.loadingStatus)
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) => {
      return a?.id === b?.id
    }
  )

  if (loadingStatus === 'not loaded') {
    dispatch(fetchApplication({ applicationId }))
  }

  useEffect(() => {
    if (application) {
      setKeys(initStorage(methods.register, application.storage || []))
    }
  }, [application, setKeys, methods.register])

  return (
    <FormProvider {...methods}>
      <PageSettingsStorage
        keys={keys}
        onRemove={(key) => setKeys(onRemove(key, methods.unregister, keys))}
        onAddStorage={() => setKeys(addStorage(methods.register, keys))}
      />
    </FormProvider>
  )
}

export default PageSettingsStorageFeature
