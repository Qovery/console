import { OrganizationCustomRoleCreateRequest } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchAvailableRoles, postCustomRoles } from '@qovery/domains/organization'
import { SETTINGS_ROLES_EDIT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { AppDispatch } from '@qovery/store'
import CreateModal from '../../../ui/page-organization-roles/create-modal/create-modal'

export interface CreateModalFeatureProps {
  onClose: () => void
  organizationId?: string
}

export function CreateModalFeature(props: CreateModalFeatureProps) {
  const { organizationId = '', onClose } = props

  const navigate = useNavigate()
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
      .then((result) => {
        // fetch the list of available roles after add new role
        dispatch(fetchAvailableRoles({ organizationId }))

        setLoading(false)
        onClose()
        // redirect to edit page
        navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_EDIT_URL(result.id)}`)
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
