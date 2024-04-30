import { type OrganizationApiTokenCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useAvailableRoles, useCreateApiToken } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import CrudModal from '../../../ui/page-organization-api/crud-modal/crud-modal'
import ValueModal from '../../../ui/page-organization-api/value-modal/value-modal'

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId?: string
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const { organizationId = '', onClose } = props
  const { mutateAsync: createApiToken } = useCreateApiToken()
  const { data: availableRoles = [], isFetched: isFetchedAvailableRoles } = useAvailableRoles({ organizationId })

  const { openModal, closeModal, enableAlertClickOutside } = useModal()
  const [loading, setLoading] = useState(false)

  const methods = useForm<OrganizationApiTokenCreateRequest>({
    mode: 'onChange',
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true)

    try {
      const token = await createApiToken({ organizationId, apiTokenCreateRequest: data })
      onClose()
      if (token) {
        openModal({
          content: <ValueModal token={token.token ?? ''} onClose={closeModal} />,
        })
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  })

  if (!isFetchedAvailableRoles) return null

  return (
    <FormProvider {...methods}>
      <CrudModal onSubmit={onSubmit} onClose={onClose} loading={loading} availableRoles={availableRoles} />
    </FormProvider>
  )
}

export default CrudModalFeature
