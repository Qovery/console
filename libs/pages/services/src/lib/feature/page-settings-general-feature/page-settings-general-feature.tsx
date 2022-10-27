import equal from 'fast-deep-equal'
import { Cluster, Environment } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectEnvironmentById, updateEnvironment } from '@qovery/domains/environment'
import { fetchClusters, selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '' } = useParams()
  useDocumentTitle('Environment General - Settings - Qovery')
  const dispatch = useDispatch<AppDispatch>()
  const methods = useForm({
    mode: 'onChange',
  })

  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  const environment = useSelector<RootState, Environment | undefined>(
    (state) => selectEnvironmentById(state, environmentId),
    equal
  )

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data) {
      delete data['cluster_id']
      await dispatch(updateEnvironment({ environmentId, data }))
    }
  })

  useEffect(() => {
    dispatch(fetchClusters({ organizationId }))
  }, [dispatch, organizationId])

  useEffect(() => {
    methods.setValue('name', environment?.name)
    methods.setValue('mode', environment?.mode)
    methods.setValue('cluster_id', environment?.cluster_id)
  }, [methods, environment])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral clusters={clusters} onSubmit={onSubmit} />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
