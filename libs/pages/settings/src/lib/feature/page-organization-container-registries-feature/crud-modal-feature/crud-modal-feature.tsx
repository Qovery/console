import { ContainerRegistryRequest, ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  editOrganizationContainerRegistry,
  fetchAvailableContainerRegistry,
  postOrganizationContainerRegistry,
  selectAvailableContainerRegistry,
  selectAvailableContainerRegistryLoadingStatus,
} from '@qovery/domains/organization'
import { AppDispatch, RootState } from '@qovery/store'
import CrudModal from '../../../ui/page-organization-container-registries/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId?: string
  registry?: ContainerRegistryResponse
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const { organizationId = '', onClose, registry } = props

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    defaultValues: {
      name: registry?.name,
      description: registry?.description,
      url: registry?.url,
      kind: registry?.kind,
      config: {},
    },
    mode: 'onChange',
  })

  useEffect(() => {
    setTimeout(() => methods.clearErrors('config'), 0)
  }, [methods])

  const availableContainerRegistry = useSelector((state: RootState) => selectAvailableContainerRegistry(state))
  const availableContainerRegistryLoadingStatus = useSelector((state: RootState) =>
    selectAvailableContainerRegistryLoadingStatus(state)
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (availableContainerRegistryLoadingStatus !== 'loaded') dispatch(fetchAvailableContainerRegistry())
  }, [dispatch, availableContainerRegistryLoadingStatus])

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)

    if (registry) {
      dispatch(
        editOrganizationContainerRegistry({
          organizationId: organizationId,
          containerRegistryId: registry.id,
          data: data as ContainerRegistryRequest,
        })
      )
        .unwrap()
        .then(() => {
          setLoading(false)
          onClose()
        })
        .catch((e) => {
          setLoading(false)
          console.error(e)
        })
    } else {
      dispatch(
        postOrganizationContainerRegistry({
          organizationId: organizationId,
          data: data as ContainerRegistryRequest,
        })
      )
        .unwrap()
        .then(() => {
          setLoading(false)
          onClose()
        })
        .catch((e) => {
          setLoading(false)
          console.error(e)
        })
    }
  })

  return (
    <FormProvider {...methods}>
      <CrudModal
        registry={registry}
        availableContainerRegistry={availableContainerRegistry || []}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={loading}
        isEdit={!!registry}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
