import { OrganizationApiTokenCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { postApiToken } from '@qovery/domains/organization'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch } from '@qovery/store'
import CrudModal from '../../../ui/page-organization-api/crud-modal/crud-modal'
import ValueModal from '../../../ui/page-organization-api/value-modal/value-modal'

export interface CrudModalFeatureProps {
  onClose: () => void
  organizationId?: string
}

export function CrudModalFeature(props: CrudModalFeatureProps) {
  const { organizationId = '', onClose } = props
  const { openModal, closeModal } = useModal()

  const [loading, setLoading] = useState(false)

  const methods = useForm<OrganizationApiTokenCreateRequest>({
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange',
  })

  const dispatch = useDispatch<AppDispatch>()

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
        openModal({
          content: <ValueModal token={token.token || ''} onClose={closeModal} />,
        })
        onClose()
      })
      .catch((e) => {
        setLoading(false)
        console.error(e)
      })
  })

  return (
    <FormProvider {...methods}>
      <CrudModal onSubmit={onSubmit} onClose={onClose} loading={loading} />
    </FormProvider>
  )
}

export default CrudModalFeature
