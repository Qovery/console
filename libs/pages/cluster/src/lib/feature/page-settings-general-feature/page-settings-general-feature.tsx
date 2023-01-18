import { useEffect } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectClusterById } from '@qovery/domains/organization'
import { ClusterEntity } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleContainerSubmit = (data: FieldValues, cluster: ClusterEntity) => {
  return {
    ...cluster,
    name: data['name'],
    description: data['description'] || '',
  }
}

export function PageSettingsGeneralFeature() {
  const { clusterId = '' } = useParams()
  // const dispatch = useDispatch<AppDispatch>()

  const methods = useForm({
    mode: 'onChange',
  })

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state) => selectClusterById(state, clusterId))

  const onSubmit = methods.handleSubmit((data) => {
    if (data && cluster) {
      const cloneCluster = handleContainerSubmit(data, cluster)

      console.log(cloneCluster)

      // dispatch(
      //   editApplication({
      //     applicationId: applicationId,
      //     data: cloneCluster,
      //     serviceType: getServiceType(application),
      //     toasterCallback,
      //   })
      // )
    }
  })

  useEffect(() => {
    methods.setValue('name', cluster?.name)
    methods.setValue('description', cluster?.description)
    methods.setValue('production', cluster?.production)
  }, [methods, cluster?.name, cluster?.description, cluster?.production])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
