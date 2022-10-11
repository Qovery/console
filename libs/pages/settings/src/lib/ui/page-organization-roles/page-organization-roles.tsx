import {
  OrganizationCustomRole,
  OrganizationCustomRoleClusterPermissions,
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleProjectPermissions,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { Controller, FieldValues, useFormContext } from 'react-hook-form'
import { LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  EmptyState,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  InputTextArea,
  LoaderSpinner,
} from '@qovery/shared/ui'
import { defaultProjectPermission } from '../../feature/page-organization-roles-feature/page-organization-roles-feature'
import RowCluster from './row-cluster/row-cluster'
import RowProject from './row-project/row-project'
import TableClusters from './table-clusters/table-clusters'
import Table from './table/table'

export interface PageOrganizationRolesProps {
  onSubmit: () => void
  setCurrentRole: Dispatch<SetStateAction<OrganizationCustomRole | undefined>>
  customRoles?: OrganizationCustomRole[]
  currentRole?: OrganizationCustomRole
  loading?: LoadingStatus
  loadingForm?: boolean
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

export function PageOrganizationRoles(props: PageOrganizationRolesProps) {
  const { currentRole, customRoles, loading, loadingForm, onSubmit, setCurrentRole } = props

  const { control, formState, reset } = useFormContext()

  useEffect(() => {
    // set default values for form
    const result: FieldValues = {
      project_permissions: {},
      cluster_permissions: {},
      name: currentRole?.name,
      description: currentRole?.description,
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

    reset(result)
  }, [currentRole, setCurrentRole, reset])

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Manage your custom roles</h1>
            <p className="text-text-500 text-xs">Set cluster and project permissions for each of your custom roles.</p>
          </div>
          <Button onClick={() => console.log('hello')} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add new role
          </Button>
        </div>
        {(loading === 'not loaded' || loading === 'loading') && customRoles?.length === 0 ? (
          <div data-testid="custom-roles-loader" className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : customRoles && customRoles.length > 0 ? (
          <div>
            <div className="max-w-sm">
              <InputSelect
                className="mb-5"
                label="Select a role"
                value={currentRole?.name}
                options={customRoles.map((customRole: OrganizationCustomRole) => ({
                  label: customRole.name || '',
                  value: customRole.name || '',
                }))}
                onChange={(value) => {
                  const currentCustomRole = customRoles.filter((c) => c.name === value)
                  setCurrentRole(currentCustomRole[0])
                }}
              />
            </div>
            <form onSubmit={onSubmit}>
              <div className="max-w-content-with-navigation-left">
                <BlockContent title="General informations">
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
              {currentRole?.cluster_permissions && (
                <TableClusters clusters={currentRole?.cluster_permissions}>
                  <div>
                    {currentRole.cluster_permissions.map((cluster: OrganizationCustomRoleClusterPermissions) => (
                      <RowCluster key={cluster.cluster_id} cluster={cluster} />
                    ))}
                  </div>
                </TableClusters>
              )}
              {currentRole?.project_permissions && (
                <Table
                  title="Project level permissions"
                  headArray={['Admin', 'Manager', 'Deployer', 'Viewer', 'No Access']}
                >
                  {currentRole.project_permissions.map((project: OrganizationCustomRoleProjectPermissions) => (
                    <RowProject key={project.project_id} project={project} />
                  ))}
                </Table>
              )}
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  dataTestId="submit-button"
                  className="btn--no-min-w"
                  type="submit"
                  size={ButtonSize.XLARGE}
                  disabled={!formState.isValid}
                  loading={loadingForm}
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <EmptyState title="Create your first custom role" imageWidth="w-[160px]">
            <Button className="mt-5" onClick={() => console.log('hello')}>
              Create role
            </Button>
          </EmptyState>
        )}
      </div>
    </div>
  )
}

export default PageOrganizationRoles
