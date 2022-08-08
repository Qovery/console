import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'
import { FormProvider, useForm } from 'react-hook-form'
import { useState } from 'react'
import { onAddStorage, onRemove } from './utils/utils'

export function PageSettingsDomainsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({ defaultValues: {} })

  const [keys, setKeys] = useState<string[]>([])

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
