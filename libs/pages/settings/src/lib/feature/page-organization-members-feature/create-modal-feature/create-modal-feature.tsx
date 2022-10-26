import { InviteMemberRequest, OrganizationAvailableRole } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { postInviteMember } from '@qovery/domains/organization'
import { AppDispatch } from '@qovery/store'
import CreateModal from '../../../ui/page-organization-members/create-modal/create-modal'

export interface CreateModalFeatureProps {
  onClose: () => void
  availableRoles: OrganizationAvailableRole[]
  organizationId?: string
}

export function CreateModalFeature(props: CreateModalFeatureProps) {
  const { organizationId = '', availableRoles, onClose } = props

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      // default value with admin id
      role_id: availableRoles[0].id,
    },
  })

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)

    dispatch(
      postInviteMember({
        organizationId: organizationId,
        data: data as InviteMemberRequest,
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
  })

  return (
    <FormProvider {...methods}>
      <CreateModal onSubmit={onSubmit} availableRoles={availableRoles || []} onClose={onClose} loading={loading} />
    </FormProvider>
  )
}

export default CreateModalFeature
