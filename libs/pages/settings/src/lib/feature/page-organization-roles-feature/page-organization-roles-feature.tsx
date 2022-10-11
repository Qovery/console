import {
  EnvironmentModeEnum,
  OrganizationCustomRole,
  OrganizationCustomRoleClusterPermissions,
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleProjectPermissions,
  OrganizationCustomRoleUpdateRequest,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editCustomRole, fetchCustomRoles, selectOrganizationById } from '@qovery/domains/organization'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

export const defaultProjectPermission = (permission: string) => {
  return [
    {
      environment_type: EnvironmentModeEnum.DEVELOPMENT,
      permission: permission,
    },
    {
      environment_type: EnvironmentModeEnum.PREVIEW,
      permission: permission,
    },
    {
      environment_type: EnvironmentModeEnum.STAGING,
      permission: permission,
    },
    {
      environment_type: EnvironmentModeEnum.PRODUCTION,
      permission: permission,
    },
  ]
}

export const handleSubmit = (data: FieldValues, currentRole: OrganizationCustomRole) => {
  const cloneCurrentRole = Object.assign({}, currentRole)

  // update project permissions
  const projectPermissions = currentRole.project_permissions?.map((project) => {
    const currentProject = data['project_permissions'][project.project_id || '']
    const permissions = Object.entries(currentProject)
      .map((permission) => ({
        environment_type: permission[0],
        permission: permission[1],
      }))
      .filter((c) => c.environment_type !== 'ADMIN')

    const isAdmin = permissions[0].permission === 'ADMIN'

    return {
      project_id: project.project_id,
      project_name: project.project_name,
      is_admin: isAdmin,
      permissions: isAdmin ? defaultProjectPermission(OrganizationCustomRoleProjectPermission.MANAGER) : permissions,
    }
  })

  cloneCurrentRole.project_permissions = projectPermissions as OrganizationCustomRoleProjectPermissions[]

  // update cluster permissions
  const clusterPermissions = currentRole.cluster_permissions?.map((cluster) => {
    const currentClusterPermission = data['cluster_permissions'][cluster.cluster_id || '']

    return {
      cluster_id: cluster.cluster_id,
      permission: currentClusterPermission,
    }
  })

  cloneCurrentRole.cluster_permissions = clusterPermissions as OrganizationCustomRoleClusterPermissions[]

  return cloneCurrentRole
}

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const [loading, setLoading] = useState(false)
  const [currentRole, setCurrentRole] = useState<OrganizationCustomRole | undefined>()

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const customRolesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.customRoles?.loadingStatus
  )
  const customRoles = organization?.customRoles?.items
  const dispatch = useDispatch<AppDispatch>()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    if (organization && customRolesLoadingStatus !== 'loaded') dispatch(fetchCustomRoles({ organizationId }))
  }, [organization, customRolesLoadingStatus, dispatch, organizationId])

  useEffect(() => {
    if (customRoles) setCurrentRole(customRoles[0])
  }, [customRoles])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && currentRole) {
      setLoading(false)

      const cloneCustomRole = handleSubmit(data, currentRole)

      dispatch(
        editCustomRole({
          organizationId,
          customRoleId: currentRole?.id || '',
          data: cloneCustomRole as OrganizationCustomRoleUpdateRequest,
        })
      )
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <PageOrganizationRoles
        customRoles={customRoles}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onSubmit={onSubmit}
        loading={customRolesLoadingStatus || 'not loaded'}
        loadingForm={loading}
        onAddRole={() => {
          openModal({ content: <CreateModalFeature organizationId={organizationId} onClose={closeModal} /> })
        }}
        onDeleteRole={(customRole: OrganizationCustomRole) => {
          openModalConfirmation({
            title: 'Delete custom role',
            isDelete: true,
            description: 'Are you sure you want to delete this custom role?',
            name: customRole?.name,
            action: () => {
              console.log('hello')
            },
          })
        }}
      />
    </FormProvider>
  )
}

export default PageOrganizationRolesFeature
