import { OrganizationCustomRole, OrganizationCustomRoleProjectPermissions } from 'qovery-typescript-axios'
import { Dispatch, SetStateAction } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  ButtonStyle,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  InputTextArea,
  LoaderSpinner,
} from '@qovery/shared/ui'
import RowProject from './row-project/row-project'
import TableClusters from './table-clusters/table-clusters'
import Table from './table/table'

export interface PageOrganizationRolesProps {
  onSubmit: () => void
  setCurrentRole: Dispatch<SetStateAction<OrganizationCustomRole | undefined>>
  onAddRole: () => void
  onDeleteRole: (customRole: OrganizationCustomRole) => void
  customRoles?: OrganizationCustomRole[]
  currentRole?: OrganizationCustomRole
  loading?: LoadingStatus
  loadingForm?: boolean
}

export function PageOrganizationRoles(props: PageOrganizationRolesProps) {
  const { currentRole, customRoles, loading, loadingForm, onSubmit, setCurrentRole, onAddRole, onDeleteRole } = props

  const { control, formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Manage your custom roles</h1>
            <p className="text-text-500 text-xs">Set cluster and project permissions for each of your custom roles.</p>
          </div>
          <Button onClick={onAddRole} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
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
                dataTestId="select-custom-roles"
                className="mb-5"
                isSearchable
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
            {currentRole && (
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
                {currentRole?.cluster_permissions && <TableClusters clusters={currentRole?.cluster_permissions} />}
                {currentRole?.project_permissions && (
                  <Table
                    title="Project level permissions"
                    headArray={[
                      {
                        label: 'Admin',
                        tooltip:
                          'The user is admin of the project and can do everything he wants on it (no matter the environment type)',
                      },
                      {
                        label: 'Manager',
                        tooltip:
                          'Manage the deployments and the settings of this environment type (including adding or removing services)',
                      },
                      {
                        label: 'Deployer',
                        tooltip:
                          'Manage the deployments of this environment type, access the logs, connect via SSH to the application and manage its environment variables.',
                      },
                      {
                        label: 'Viewer',
                        tooltip: 'Access in read-only this environment type.',
                      },
                      {
                        label: 'No Access',
                        tooltip: 'The user has no access to this environment type.',
                      },
                    ]}
                  >
                    {currentRole.project_permissions.map((project: OrganizationCustomRoleProjectPermissions) => (
                      <RowProject key={project.project_id} project={project} />
                    ))}
                  </Table>
                )}
                <div className="flex gap-3 justify-between mt-6">
                  {currentRole && (
                    <Button
                      dataTestId="delete-button"
                      className="btn--no-min-w"
                      style={ButtonStyle.ERROR}
                      size={ButtonSize.XLARGE}
                      onClick={() => onDeleteRole(currentRole)}
                    >
                      Delete role
                    </Button>
                  )}
                  <Button
                    dataTestId="submit-save-button"
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
            )}
          </div>
        ) : (
          <EmptyState dataTestId="empty-state" title="Create your first custom role" imageWidth="w-[160px]">
            <Button className="mt-5" onClick={onAddRole}>
              Add new role
            </Button>
          </EmptyState>
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#custom-roles',
            linkLabel: 'How to configure my custom roles',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationRoles
