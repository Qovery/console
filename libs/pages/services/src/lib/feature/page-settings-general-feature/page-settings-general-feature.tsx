import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useEditEnvironment, useFetchEnvironment } from '@qovery/domains/environment'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export function PageSettingsGeneralFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  useDocumentTitle('Environment General - Settings - Qovery')
  const methods = useForm({
    mode: 'onChange',
  })

  const { data: clusters = [] } = useClusters({ organizationId })

  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const editEnvironment = useEditEnvironment(projectId, () => setLoading(false))

  const [loading, setLoading] = useState(false)

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    if (data) {
      delete data['cluster_id']
      editEnvironment.mutate({ environmentId, data })
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
