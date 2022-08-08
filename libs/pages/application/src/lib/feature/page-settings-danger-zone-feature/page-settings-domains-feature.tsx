import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'
import { FormProvider, useForm } from 'react-hook-form'
import { useState } from 'react'
import { onAddStorage, onRemove } from './utils/utils'
import { LoadingStatus } from '@console/shared/interfaces'
import { fetchApplication } from '@console/domains/application'

export function PageSettingsDomainsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({ defaultValues: {} })

  const [keys, setKeys] = useState<string[]>([])

  const loadingStatus = useSelector<RootState, LoadingStatus>((state) => state.entities.applications.loadingStatus)

  if (loadingStatus === 'not loaded') {
    dispatch(fetchApplication({ applicationId }))
  }

  return (
    <FormProvider {...methods}>
      <PageSettingsDomains
        keys={keys}
        onRemove={(key) => setKeys(onRemove(key, methods.unregister, keys))}
        onAddStorage={() => setKeys(onAddStorage(methods.register, keys))}
      />
    </FormProvider>
  )
}

export default PageSettingsDomainsFeature
