import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editCluster, postClusterActionsDeploy, selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { AppDispatch, RootState } from '@qovery/state/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, cluster: ClusterEntity) => {
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

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))

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
