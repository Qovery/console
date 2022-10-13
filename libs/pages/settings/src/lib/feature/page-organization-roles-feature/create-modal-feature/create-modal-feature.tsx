import { OrganizationCustomRole, OrganizationCustomRoleCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { postCustomRoles } from '@qovery/domains/organization'
import { AppDispatch } from '@qovery/store/data'
import CreateModal from '../../../ui/page-organization-roles/create-modal/create-modal'

export interface CreateModalFeatureProps {
  setCurrentRole: (customRole: OrganizationCustomRole) => void
  onClose: () => void
  organizationId?: string
}

export function CreateModalFeature(props: CreateModalFeatureProps) {
  const { organizationId = '', onClose, setCurrentRole } = props

  const [loading, setLoading] = useState(false)

  const methods = useForm({
    mode: 'onChange',
  })

  const dispatch = useDispatch<AppDispatch>()

  const onSubmit = methods.handleSubmit((data) => {
    setLoading(true)

    dispatch(
      postCustomRoles({
        organizationId: organizationId,
        data: data as OrganizationCustomRoleCreateRequest,
      })
    )
      .unwrap()
      .then((result: OrganizationCustomRole) => {
        setCurrentRole(result)
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
      <CreateModal onSubmit={onSubmit} onClose={onClose} loading={loading} />
    </FormProvider>
  )
}

export default CreateModalFeature
