import {
  OrganizationCustomRole,
  OrganizationCustomRoleProjectPermission,
  OrganizationCustomRoleProjectPermissions,
  OrganizationCustomRoleUpdateRequestPermissions,
} from 'qovery-typescript-axios'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonSize,
  EmptyState,
  IconAwesomeEnum,
  InputText,
  InputTextArea,
  LoaderSpinner,
  Tabs,
} from '@qovery/shared/ui'
import TableProject from './table-project/table-project'

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
    const result = {
      project_permissions: {},
      name: currentRole?.name,
      description: currentRole?.description,
    } as any

    currentRole?.project_permissions?.forEach((project: OrganizationCustomRoleProjectPermissions) => {
      const permission = {} as any

      project.permissions?.forEach((currentPermission: OrganizationCustomRoleUpdateRequestPermissions) => {
        permission['ADMIN'] = project.is_admin ? 'ADMIN' : OrganizationCustomRoleProjectPermission.NO_ACCESS

        permission[currentPermission.environment_type || ''] = getValue(currentPermission.permission)
      })

      result['project_permissions'][project.project_id || ''] = permission
    })

    reset(result)
  }, [currentRole, reset])

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
            <Tabs
              className="mb-5"
              items={customRoles.map((customRoles: OrganizationCustomRole) => ({
                name: customRoles.name,
                active: currentRole?.name === customRoles.name,
                onClick: () => setCurrentRole(customRoles),
              }))}
            />
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
              {currentRole?.project_permissions && <TableProject projects={currentRole.project_permissions} />}
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
