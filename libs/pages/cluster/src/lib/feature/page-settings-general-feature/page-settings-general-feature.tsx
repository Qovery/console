import { type Cluster } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { editCluster, postClusterActionsDeploy } from '@qovery/domains/organization'
import { type AppDispatch } from '@qovery/state/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, cluster: Cluster) => {
  return {
    ...cluster,
    name: data['name'],
    description: data['description'] || '',
    production: data['production'],
  }
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', clusterId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
  })

  const { data: cluster } = useCluster({ organizationId, clusterId })

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      setLoading(true)

      const cloneCluster = handleSubmit(data, cluster)

      const toasterCallback = () => {
        if (cluster) {
          dispatch(postClusterActionsDeploy({ organizationId, clusterId }))
        }
      }

      dispatch(
        editCluster({
          organizationId: organizationId,
          clusterId: clusterId,
          data: cloneCluster,
          toasterCallback,
        })
      )
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  })

  useEffect(() => {
    methods.setValue('name', cluster?.name)
    methods.setValue('description', cluster?.description)
    methods.setValue('production', cluster?.production)
  }, [methods, cluster?.name, cluster?.description, cluster?.production])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral onSubmit={onSubmit} loading={loading} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
