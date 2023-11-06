import { type ContainerRegistryRequest, type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  useAvailableContainerRegistry,
  useCreateContainerRegistry,
  useEditContainerRegistry,
} from '@qovery/domains/organizations/feature'
import CrudModal from '../../../ui/page-organization-container-registries/crud-modal/crud-modal'

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId?: string
  registry?: ContainerRegistryResponse
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const { organizationId = '', onClose, registry } = props

  const { data: availableContainerRegistry = [] } = useAvailableContainerRegistry({ organizationId })
  const { mutateAsync: editContainerRegistry } = useEditContainerRegistry({ organizationId })
  const { mutateAsync: createContainerRegistry } = useCreateContainerRegistry({ organizationId })
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

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    try {
      if (registry) {
        await editContainerRegistry({
          organizationId: organizationId,
          containerRegistryId: registry.id,
          containerRegistryRequest: data as ContainerRegistryRequest,
        })
        onClose()
      } else {
        await createContainerRegistry({
          organizationId: organizationId,
          containerRegistryRequest: data as ContainerRegistryRequest,
        })
        onClose()
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  })

  return (
    <FormProvider {...methods}>
      <CrudModal
        registry={registry}
        availableContainerRegistry={availableContainerRegistry}
        onSubmit={onSubmit}
        onClose={onClose}
        loading={loading}
        isEdit={!!registry}
      />
    </FormProvider>
  )
}

export default CrudModalFeature
