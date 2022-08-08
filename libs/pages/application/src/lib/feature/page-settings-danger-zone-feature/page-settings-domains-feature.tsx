import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'
import { FormProvider, useForm } from 'react-hook-form'
import { useState } from 'react'

export function PageSettingsDomainsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({ defaultValues: {} })
  const [keys, setKeys] = useState<string[]>([])

  const onRemove = (key: string) => {}
  const onAddStorage = () => {}

  return (
    <FormProvider {...methods}>
      <PageSettingsDomains keys={keys} onRemove={onRemove} onAddStorage={onAddStorage} />
    </FormProvider>
  )
}

export default PageSettingsDomainsFeature
