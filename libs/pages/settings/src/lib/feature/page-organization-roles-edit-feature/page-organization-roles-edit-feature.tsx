import {
  EnvironmentModeEnum,
  type OrganizationCustomRole,
  type OrganizationCustomRoleClusterPermissionsInner,
  OrganizationCustomRoleProjectPermission,
  type OrganizationCustomRoleProjectPermissionsInner,
  type OrganizationCustomRoleUpdateRequest,
  type OrganizationCustomRoleUpdateRequestProjectPermissionsInnerPermissionsInner,
} from 'qovery-typescript-axios'
import { useCallback, useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomRole, useDeleteCustomRole, useEditCustomRole } from '@qovery/domains/organizations/feature'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationRolesEdit from '../../ui/page-organization-roles-edit/page-organization-roles-edit'

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

  cloneCurrentRole.name = data['name']
  cloneCurrentRole.description = data['description']

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

  cloneCurrentRole.project_permissions = projectPermissions as OrganizationCustomRoleProjectPermissionsInner[]

  // update cluster permissions
  const clusterPermissions = currentRole.cluster_permissions?.map((cluster) => {
    const currentClusterPermission = data['cluster_permissions'][cluster.cluster_id || '']

    return {
      cluster_id: cluster.cluster_id,
      cluster_name: cluster.cluster_name,
      permission: currentClusterPermission,
    }
  })

  cloneCurrentRole.cluster_permissions = clusterPermissions as OrganizationCustomRoleClusterPermissionsInner[]

  return cloneCurrentRole
}

export function getValue(permission: OrganizationCustomRoleProjectPermission, isAdmin = false) {
  let result: OrganizationCustomRoleProjectPermission = OrganizationCustomRoleProjectPermission.NO_ACCESS

  if (isAdmin) {
    result = OrganizationCustomRoleProjectPermission.MANAGER
  } else {
    result = OrganizationCustomRoleProjectPermission[permission]
  }

  return result
}

export function resetForm(currentRole: OrganizationCustomRole) {
  // set default values for form
  const result: FieldValues = {
    project_permissions: {},
    cluster_permissions: {},
    name: currentRole?.name,
    description: currentRole?.description || ' ',
  }

  currentRole?.project_permissions?.forEach((project: OrganizationCustomRoleProjectPermissionsInner) => {
    const permission = {} as { [key: string]: string }

    if (project.permissions && project.permissions?.length > 0) {
      project.permissions?.forEach(
        (currentPermission: OrganizationCustomRoleUpdateRequestProjectPermissionsInnerPermissionsInner) => {
          permission['ADMIN'] = project.is_admin ? 'ADMIN' : OrganizationCustomRoleProjectPermission.NO_ACCESS
          permission[currentPermission.environment_type || ''] = getValue(currentPermission.permission ?? 'NO_ACCESS')
        }
      )
    } else {
      if (project.is_admin) {
        for (let i = 0; i < 4; i++) {
          const currentPermission = defaultProjectPermission('ADMIN')[i]
          permission['ADMIN'] = 'ADMIN'
          permission[currentPermission.environment_type || ''] = 'ADMIN'
        }
      }
    }

    result['project_permissions'][project.project_id || ''] = permission
  })

  currentRole?.cluster_permissions?.forEach((cluster: OrganizationCustomRoleClusterPermissionsInner) => {
    result['cluster_permissions'][cluster.cluster_id || ''] = cluster.permission
  })

  return result
}

export function PageOrganizationRolesEditFeature() {
  const { organizationId = '', roleId = '' } = useParams()

  useDocumentTitle('Edit roles & permissions - Organization settings')

  const navigate = useNavigate()

  const { data: customRole, isLoading: isLoadingCustomRole } = useCustomRole({ organizationId, customRoleId: roleId })
  const { mutateAsync: editCustomRole, isLoading: isLoadingEditCustomRole } = useEditCustomRole()
  const { mutateAsync: deleteCustomRole } = useDeleteCustomRole()

  const { openModalConfirmation } = useModalConfirmation()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    if (customRole) {
      const result = resetForm(customRole)
      methods.reset(result)
    }
  }, [customRole, methods])

  const redirectPageRoles = useCallback(
    () => navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_URL}`),
    [navigate, organizationId]
  )

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && customRole) {
      const cloneCustomRole = handleSubmit(data, customRole)

      try {
        await editCustomRole({
          organizationId,
          customRoleId: customRole.id ?? '',
          customRoleUpdateRequest: cloneCustomRole as OrganizationCustomRoleUpdateRequest,
        })
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <FormProvider {...methods}>
      <PageOrganizationRolesEdit
        currentRole={customRole}
        onSubmit={onSubmit}
        loading={isLoadingCustomRole}
        loadingForm={isLoadingEditCustomRole}
        onDeleteRole={(customRole: OrganizationCustomRole) => {
          openModalConfirmation({
            title: 'Delete custom role',
            isDelete: true,
            name: customRole?.name,
            action: async () => {
              try {
                await deleteCustomRole({
                  organizationId: organizationId,
                  customRoleId: customRole.id ?? '',
                })
                redirectPageRoles()
              } catch (error) {
                console.error(error)
              }
            },
          })
        }}
      />
    </FormProvider>
  )
}

export default PageOrganizationRolesEditFeature
