import { type OrganizationApiTokenCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAvailableRoles, selectOrganizationById } from '@qovery/domains/organization'
import { useCreateApiToken } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import CrudModal from '../../../ui/page-organization-api/crud-modal/crud-modal'
import ValueModal from '../../../ui/page-organization-api/value-modal/value-modal'

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId?: string
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const { organizationId = '', onClose } = props
  const dispatch = useDispatch<AppDispatch>()
  const { mutateAsync: createApiToken } = useCreateApiToken({ organizationId })

  const { openModal, closeModal } = useModal()
  const [loading, setLoading] = useState(false)
  const availableRoles = useSelector((state: RootState) =>
    selectOrganizationById(state, organizationId)
  )?.availableRoles

  if (!availableRoles) {
    dispatch(fetchAvailableRoles({ organizationId }))
  }

  const methods = useForm<OrganizationApiTokenCreateRequest>({
    mode: 'onChange',
  })

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

  if (!availableRoles?.items) return null

  return (
    <FormProvider {...methods}>
      <CrudModal onSubmit={onSubmit} onClose={onClose} loading={loading} availableRoles={availableRoles?.items} />
    </FormProvider>
  )
}

export default CrudModalFeature
