import { type OrganizationApiTokenCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAvailableRoles, postApiToken, selectOrganizationById } from '@qovery/domains/organization'
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

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)

    dispatch(
      postApiToken({
        organizationId: organizationId,
        token: data,
      })
    )
      .unwrap()
      .then((token) => {
        setLoading(false)
        onClose()

        openModal({
          content: <ValueModal token={token.token ?? ''} onClose={closeModal} />,
        })
      })
      .catch((e) => {
        setLoading(false)
        console.error(e)
      })
  })

  if (!availableRoles?.items) return null

  return (
    <FormProvider {...methods}>
      <CrudModal onSubmit={onSubmit} onClose={onClose} loading={loading} availableRoles={availableRoles?.items} />
    </FormProvider>
  )
}

export default CrudModalFeature
