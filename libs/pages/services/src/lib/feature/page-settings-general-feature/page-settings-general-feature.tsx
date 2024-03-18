import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useEditEnvironment, useEnvironment } from '@qovery/domains/environments/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '' } = useParams()
  useDocumentTitle('Environment General - Settings - Qovery')
  const methods = useForm({
    mode: 'onChange',
  })

  const { data: clusters = [] } = useClusters({ organizationId })

  const { data: environment } = useEnvironment({ environmentId })
  const { mutateAsync: editEnvironment } = useEditEnvironment()

  const [loading, setLoading] = useState(false)

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    if (data) {
      delete data['cluster_id']
      await editEnvironment({ environmentId, payload: data })
      setLoading(false)
    }
  })

  useEffect(() => {
    methods.setValue('name', environment?.name)
    methods.setValue('mode', environment?.mode)
    methods.setValue('cluster_id', environment?.cluster_id)
  }, [methods, environment])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral clusters={clusters} onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
