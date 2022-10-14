import {
  EnvironmentModeEnum,
  OrganizationCustomRole,
  OrganizationCustomRoleClusterPermissions,
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleProjectPermissions,
  OrganizationCustomRoleUpdateRequest,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteCustomRole,
  editCustomRole,
  fetchCustomRoles,
  selectOrganizationById,
} from '@qovery/domains/organization'
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

export function PageOrganizationRolesFeature() {
  const { organizationId = '' } = useParams()

  useDocumentTitle('Roles & permissions - Organization settings')

  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId))
  const customRolesLoadingStatus = useSelector(
    (state: RootState) => selectOrganizationById(state, organizationId)?.customRoles?.loadingStatus
  )
  const customRoles = organization?.customRoles?.items

  const [currentRole, setCurrentRole] = useState<OrganizationCustomRole | undefined>(customRoles && customRoles[0])
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch<AppDispatch>()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const methods = useForm({
    mode: 'onChange',
  })

  useEffect(() => {
    if (organization && (!customRolesLoadingStatus || customRolesLoadingStatus === 'not loaded')) {
      dispatch(fetchCustomRoles({ organizationId }))
        .unwrap()
        .then((result: OrganizationCustomRole[]) => {
          // set default custom role
          setCurrentRole(result[0])
        })
    }
  }, [organization, customRolesLoadingStatus, dispatch, organizationId, customRoles])

  useEffect(() => {
    if (currentRole) {
      const result = resetForm(currentRole)
      methods.reset(result)
    }
  }, [currentRole, setCurrentRole, methods])

  const onSubmit = methods.handleSubmit((data) => {
    if (data && currentRole) {
      setLoading(true)

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
          openModal({
            content: (
              <CreateModalFeature
                organizationId={organizationId}
                onClose={closeModal}
                setCurrentRole={setCurrentRole}
              />
            ),
          })
        }}
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
                .then(() => {
                  if (!customRoles) return

                  for (let index = 0; index < customRoles.length; index++) {
                    const current = customRoles[index]
                    // set new current role
                    if (current.id !== currentRole?.id) {
                      setCurrentRole(current)
                      window.scrollTo(0, 0)
                      return
                    }
                  }
                })
            },
          })
        }}
      />
    </FormProvider>
  )
}

export default PageOrganizationRolesFeature
