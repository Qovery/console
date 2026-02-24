import { useNavigate, useParams } from '@tanstack/react-router'
import {
  type OrganizationCustomRole,
  type OrganizationCustomRoleClusterPermissionsInner,
  OrganizationCustomRoleProjectPermission,
  type OrganizationCustomRoleProjectPermissionsInner,
  type OrganizationCustomRoleUpdateRequest,
  type OrganizationCustomRoleUpdateRequestProjectPermissionsInnerPermissionsInner,
} from 'qovery-typescript-axios'
import { Suspense, useCallback, useEffect } from 'react'
import { type FormEventHandler } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { SETTINGS_ROLES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Button,
  Icon,
  InputText,
  InputTextArea,
  Link,
  Skeleton,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useCustomRole } from '../hooks/use-custom-role/use-custom-role'
import { useDeleteCustomRole } from '../hooks/use-delete-custom-role/use-delete-custom-role'
import { useEditCustomRole } from '../hooks/use-edit-custom-role/use-edit-custom-role'
import RowProject from './row-project/row-project'
import TableClusters from './table-clusters/table-clusters'
import Table from './table/table'
import { defaultProjectPermission } from './utils/default-project-permission'

interface PageOrganizationRolesEditProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onDeleteRole: (customRole: OrganizationCustomRole) => void
  currentRole?: OrganizationCustomRole
  loadingForm?: boolean
}

function PageOrganizationRolesEdit(props: PageOrganizationRolesEditProps) {
  const { currentRole, loadingForm, onSubmit, onDeleteRole } = props

  const { control, formState } = useFormContext()
  const { organizationId = '' } = useParams({ strict: false })

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="p-8">
        {currentRole && (
          <>
            <div className="mb-8 flex justify-between">
              <div>
                <Link
                  color="brand"
                  size="xs"
                  className="mb-1 gap-1"
                  to={SETTINGS_URL(organizationId) + SETTINGS_ROLES_URL}
                >
                  <Icon iconName="arrow-left" className="mr-1 text-xs" />
                  Back
                </Link>
                <h1 className="h5 mb-2 text-neutral">Edit your custom role: {currentRole.name}</h1>
                <p className="text-xs text-neutral-subtle">
                  Set permissions for your custom role. Cluster level permissions allow you to define access permission
                  to each cluster of your organization (default is "Read-only"). Project Level permissions allow you to
                  customize the access to each project and its environments based on its type (PROD,DEV etc.. default is
                  "No Access").
                </p>
              </div>
            </div>
            <form onSubmit={onSubmit}>
              <div className="max-w-content-with-navigation-left">
                <BlockContent title="General information">
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Please enter a name.' }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="input-name"
                        className="mb-3"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Name"
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <InputTextArea
                        dataTestId="input-description"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Description"
                      />
                    )}
                  />
                </BlockContent>
              </div>
              {currentRole?.cluster_permissions && <TableClusters clusters={currentRole?.cluster_permissions} />}
              {currentRole?.project_permissions && (
                <Table
                  title="Project level permissions"
                  headArray={[
                    {
                      label: 'Full-Access',
                      tooltip:
                        'The user is admin of the project and can do everything he wants on it (no matter the environment type)',
                    },
                    {
                      label: 'Manage',
                      tooltip:
                        'Manage the deployments and the settings of this environment type (including adding or removing services)',
                    },
                    {
                      label: 'Deploy',
                      tooltip:
                        'Manage the deployments of this environment type, access the logs, connect via SSH to the application and manage its environment variables.',
                    },
                    {
                      label: 'Read-Only',
                      tooltip: 'Access in read-only this environment type.',
                    },
                    {
                      label: 'No Access',
                      tooltip: 'The user has no access to this environment type.',
                    },
                  ]}
                >
                  {currentRole.project_permissions.map((project: OrganizationCustomRoleProjectPermissionsInner) => (
                    <RowProject key={project.project_id} project={project} />
                  ))}
                </Table>
              )}
              <div className="mb-24 mt-6 flex justify-between gap-3">
                <Button
                  type="button"
                  data-testid="delete-button"
                  color="red"
                  size="lg"
                  onClick={() => onDeleteRole(currentRole)}
                >
                  Delete role
                </Button>
                <Button
                  data-testid="submit-save-button"
                  size="lg"
                  type="submit"
                  disabled={!formState.isValid}
                  loading={loadingForm}
                >
                  Save
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const SettingsRolesEditSkeleton = () => (
  <div className="flex w-full flex-col justify-between">
    <div className="p-8">
      <div className="mb-8 flex justify-between">
        <div className="space-y-2">
          <Skeleton width={50} height={12} show={true} />
          <Skeleton width={280} height={24} show={true} />
          <Skeleton width={640} height={12} show={true} />
          <Skeleton width={560} height={12} show={true} />
        </div>
      </div>
      <div className="max-w-content-with-navigation-left">
        <BlockContent title="General information">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton width={60} height={12} show={true} />
              <Skeleton className="w-full" height={40} show={true} />
            </div>
            <div className="space-y-2">
              <Skeleton width={85} height={12} show={true} />
              <Skeleton className="w-full" height={96} show={true} />
            </div>
          </div>
        </BlockContent>
      </div>
      <div className="mt-6 flex flex-col-reverse rounded border border-neutral bg-surface-neutral text-xs text-neutral">
        <div className="flex h-10 rounded-t border-b border-neutral bg-surface-neutral">
          <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral px-4 font-medium">
            <Skeleton width={160} height={12} show={true} />
          </div>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex h-full flex-1 items-center justify-center border-r border-neutral px-4 last:border-0"
            >
              <Skeleton width={90} height={12} show={true} />
            </div>
          ))}
        </div>
        {[0, 1].map((index) => (
          <div key={index} className="flex h-10 items-center border-b border-neutral bg-surface-neutral-subtle">
            <div className="flex h-full w-1/4 flex-auto items-center border-r border-neutral px-4">
              <Skeleton width={120} height={12} show={true} />
            </div>
            {[0, 1, 2].map((cellIndex) => (
              <div
                key={cellIndex}
                className="flex h-full flex-1 items-center justify-center border-r border-neutral px-4 last:border-0"
              >
                <Skeleton square width={16} height={16} show={true} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const handleSubmitRolesEdit = (data: FieldValues, currentRole: OrganizationCustomRole) => {
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

interface SettingsRolesEditContentProps {
  organizationId: string
  roleId: string
  loadingForm: boolean
  onDeleteRole: (customRole: OrganizationCustomRole) => void
  onEditRole: (
    customRole: OrganizationCustomRole,
    customRoleUpdateRequest: OrganizationCustomRoleUpdateRequest
  ) => Promise<void>
}

function SettingsRolesEditContent({
  organizationId,
  roleId,
  loadingForm,
  onDeleteRole,
  onEditRole,
}: SettingsRolesEditContentProps) {
  const { data: customRole } = useCustomRole({ organizationId, customRoleId: roleId, suspense: true })
  const { reset, handleSubmit: handleFormSubmit } = useFormContext()

  useEffect(() => {
    if (customRole) {
      const result = resetForm(customRole)
      reset(result)
    }
  }, [customRole, reset])

  const onSubmit = handleFormSubmit(async (data) => {
    if (data && customRole) {
      const cloneCustomRole = handleSubmitRolesEdit(data, customRole)

      try {
        await onEditRole(customRole, cloneCustomRole as OrganizationCustomRoleUpdateRequest)
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <PageOrganizationRolesEdit
      currentRole={customRole}
      onSubmit={onSubmit}
      loadingForm={loadingForm}
      onDeleteRole={onDeleteRole}
    />
  )
}

export function SettingsRolesEdit() {
  const { organizationId = '', roleId = '' } = useParams({ strict: false })

  useDocumentTitle('Edit roles & permissions - Organization settings')

  const navigate = useNavigate()

  const { mutateAsync: editCustomRole, isLoading: isLoadingEditCustomRole } = useEditCustomRole()
  const { mutateAsync: deleteCustomRole } = useDeleteCustomRole()

  const { openModalConfirmation } = useModalConfirmation()

  const methods = useForm({
    mode: 'onChange',
  })

  const redirectPageRoles = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/settings/roles',
      params: {
        organizationId,
      },
    })
  }, [navigate, organizationId])

  return (
    <FormProvider {...methods}>
      <Suspense fallback={<SettingsRolesEditSkeleton />}>
        <SettingsRolesEditContent
          organizationId={organizationId}
          roleId={roleId}
          loadingForm={isLoadingEditCustomRole}
          onEditRole={async (customRole, customRoleUpdateRequest) => {
            await editCustomRole({
              organizationId,
              customRoleId: customRole.id ?? '',
              customRoleUpdateRequest,
            })
          }}
          onDeleteRole={(customRole: OrganizationCustomRole) => {
            openModalConfirmation({
              title: 'Delete custom role',
              confirmationMethod: 'action',
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
      </Suspense>
    </FormProvider>
  )
}
