import {
  EnvironmentModeEnum,
  OrganizationCustomRole,
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleProjectPermissions,
  OrganizationCustomRoleUpdateRequest,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editCustomRole, fetchCustomRoles, selectOrganizationById } from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageOrganizationRoles from '../../ui/page-organization-roles/page-organization-roles'

export const handleSubmit = (data: FieldValues, currentRole: OrganizationCustomRole) => {
  const cloneCurrentRole = Object.assign({}, currentRole)

  const defaultAdmin: OrganizationCustomRoleUpdateRequestPermissions[] = [
    {
      environment_type: EnvironmentModeEnum.DEVELOPMENT,
      permission: OrganizationCustomRoleProjectPermission.MANAGER,
    },
    {
      environment_type: EnvironmentModeEnum.PREVIEW,
      permission: OrganizationCustomRoleProjectPermission.MANAGER,
    },
    {
      environment_type: EnvironmentModeEnum.STAGING,
      permission: OrganizationCustomRoleProjectPermission.MANAGER,
    },
    {
      environment_type: EnvironmentModeEnum.PRODUCTION,
      permission: OrganizationCustomRoleProjectPermission.MANAGER,
    },
  ]

  // update project permissions
  const projectPermissions = currentRole.project_permissions?.map((project) => {
    const currentProject = data['project_permissions'][project.project_id || '']
    const permissions = Object.entries(currentProject)
      .map((permission) => ({
        environment_type: permission[0],
        permission: permission[1],
      }))
      .filter((c) => c.environment_type !== 'ADMIN')

    const isAdmin = false

    return {
      project_id: project.project_id,
      project_name: project.project_name,
      is_admin: isAdmin ? true : false,
      permissions: isAdmin ? defaultAdmin : permissions,
    }
  })

  cloneCurrentRole.project_permissions = projectPermissions as OrganizationCustomRoleProjectPermissions[]

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
      />
    </FormProvider>
  )
}

export default PageOrganizationRolesFeature
