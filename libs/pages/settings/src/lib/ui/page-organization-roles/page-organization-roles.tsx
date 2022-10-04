import { OrganizationCustomRole } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { Button, IconAwesomeEnum, LoaderSpinner, Tabs } from '@qovery/shared/ui'
import TableProject from './table-project/table-project'

export interface PageOrganizationRolesProps {
  customRoles?: OrganizationCustomRole[]
  loading?: LoadingStatus
}

export function PageOrganizationRoles(props: PageOrganizationRolesProps) {
  const { customRoles, loading } = props

  const [currentRole, setCurrentRole] = useState<OrganizationCustomRole | undefined>()

  useEffect(() => {
    if (customRoles) setCurrentRole(customRoles[0])
  }, [customRoles])

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
        ) : (
          customRoles &&
          customRoles.length > 0 && (
            <div>
              <Tabs
                className="mb-5"
                items={customRoles.map((customRoles: OrganizationCustomRole) => ({
                  name: customRoles.name,
                  active: currentRole?.name === customRoles.name,
                  onClick: () => setCurrentRole(customRoles),
                }))}
              />
              {currentRole?.project_permissions && <TableProject projects={currentRole.project_permissions} />}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default PageOrganizationRoles
