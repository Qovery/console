import {
  EnvironmentModeEnum,
  OrganizationCustomRole,
  OrganizationCustomRoleClusterPermissions,
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleProjectPermissions,
  OrganizationCustomRoleUpdateRequest,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteCustomRole, editCustomRole, fetchCustomRole, selectOrganizationById } from '@qovery/domains/organization'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
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
      cluster_name: cluster.cluster_name,
      permission: currentClusterPermission,
    }
  })

  cloneCurrentRole.cluster_permissions = clusterPermissions as OrganizationCustomRoleClusterPermissions[]

  return cloneCurrentRole
}

export function getValue(permission = OrganizationCustomRoleProjectPermission.NO_ACCESS, isAdmin = false) {
  let result = OrganizationCustomRoleProjectPermission.NO_ACCESS

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

  currentRole?.project_permissions?.forEach((project: OrganizationCustomRoleProjectPermissions) => {
    const permission = {} as { [key: string]: string }

    if (project.permissions && project.permissions?.length > 0) {
      project.permissions?.forEach((currentPermission: OrganizationCustomRoleUpdateRequestPermissions) => {
        permission['ADMIN'] = project.is_admin ? 'ADMIN' : OrganizationCustomRoleProjectPermission.NO_ACCESS
        permission[currentPermission.environment_type || ''] = getValue(currentPermission.permission)
      })
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

  currentRole?.cluster_permissions?.forEach((cluster: OrganizationCustomRoleClusterPermissions) => {
    result['cluster_permissions'][cluster.cluster_id || ''] = cluster.permission
  })

  return result
}

export function PageOrganizationRolesEditFeature() {
  const { organizationId = '', roleId = '' } = useParams()

  useDocumentTitle('Edit roles & permissions - Organization settings')

  const navigate = useNavigate()

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))

  const [currentRole, setCurrentRole] = useState<OrganizationCustomRole | undefined>()
  const [loading, setLoading] = useState(false)
  const [loadingForm, setLoadingForm] = useState(false)

  const dispatch = useDispatch<AppDispatch>()

  const { openModalConfirmation } = useModalConfirmation()

  const methods = useForm({
    mode: 'onChange',
  })

  const redirectPageRoles = useCallback(
    () => navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_URL}`),
    [navigate, organizationId]
  )

  useEffect(() => {
    if (
      organization &&
      (organization?.customRoles?.loadingStatus !== 'loaded' ||
        (organization?.customRoles?.items && organization?.customRoles?.items?.length > 0))
    ) {
      setLoading(true)

      const role = organization?.customRoles?.items?.find((currentRole) => currentRole.id === roleId)
      if (role) {
        setCurrentRole(role)
        setLoading(false)
      } else {
        dispatch(fetchCustomRole({ organizationId, customRoleId: roleId }))
          .unwrap()
          .then((result: OrganizationCustomRole) => {
            // set default custom role
            setCurrentRole(result)
          })
          .catch(() => {
            redirectPageRoles()
          })
          .finally(() => setLoading(false))
      }
    }
  }, [organization, navigate, dispatch, organizationId, roleId, redirectPageRoles])

  useEffect(() => {
    if (currentRole) {
      const result = resetForm(currentRole)
      methods.reset(result)
    }
  }, [currentRole, setCurrentRole, methods])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && currentRole) {
      setLoadingForm(true)

      const cloneCustomRole = handleSubmit(data, currentRole)

      dispatch(
        editCustomRole({
          organizationId,
          customRoleId: currentRole?.id || '',
          data: cloneCustomRole as OrganizationCustomRoleUpdateRequest,
        })
      )
        .unwrap()
        .then(() => setLoadingForm(false))
        .catch(() => setLoadingForm(false))
    }
  })

  return (
    <FormProvider {...methods}>
      <PageOrganizationRolesEdit
        currentRole={currentRole}
        onSubmit={onSubmit}
        loading={loading}
        loadingForm={loadingForm}
        onDeleteRole={(customRole: OrganizationCustomRole) => {
          openModalConfirmation({
            title: 'Delete custom role',
            isDelete: true,
            description: 'Are you sure you want to delete this custom role?',
            name: customRole?.name,
            action: () => {
              dispatch(
                deleteCustomRole({
                  organizationId: organizationId,
                  customRoleId: customRole.id || '',
                })
              )
                .unwrap()
                .then(() => redirectPageRoles())
            },
          })
        }}
      />
    </FormProvider>
  )
}

export default PageOrganizationRolesEditFeature
