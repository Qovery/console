import { type OrganizationAvailableRole, type OrganizationCustomRole } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { MemberRoleEnum } from '@qovery/shared/enums'
import { SETTINGS_ROLES_EDIT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { RolesIcons } from '../page-organization-members/row-member/row-member'

export interface PageOrganizationRolesProps {
  onAddRole: () => void
  onDeleteRole: (customRole: OrganizationCustomRole) => void
  loading: boolean
  roles?: OrganizationAvailableRole[]
}

export const isDefaultRole = (role?: string) => role && role.toUpperCase() in MemberRoleEnum

export const rolesSort = (roles: OrganizationAvailableRole[]) => {
  const currentRoles: OrganizationAvailableRole[] = []
  const currentCustomRoles: OrganizationAvailableRole[] = []

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]
    if (isDefaultRole(role.name)) {
      currentRoles.push(role)
    } else {
      currentCustomRoles.push(role)
    }
  }

  return [...currentRoles, ...currentCustomRoles]
}

export function PageOrganizationRoles(props: PageOrganizationRolesProps) {
  const { roles, onAddRole, onDeleteRole, loading } = props

  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-between w-full max-w-content-with-navigation-left">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-neutral-400 mb-2">Manage your roles</h1>
            <p className="text-neutral-400 text-xs">Manage the existing custom roles or create a new one.</p>
          </div>
          <Button onClick={onAddRole} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add new role
          </Button>
        </div>
        {(!roles || roles.length === 0) && loading ? (
          <div data-testid="roles-loader" className="flex justify-center mt-5">
            <LoaderSpinner className="w-6" />
          </div>
        ) : (
          roles &&
          roles?.length > 0 && (
            <BlockContent title="Roles" classNameContent="p-0">
              {roles &&
                rolesSort(roles)?.map((role: OrganizationAvailableRole) => (
                  <div
                    data-testid={`role-${role.id}`}
                    key={role.id}
                    className={`flex justify-between items-center px-5 py-4 border-b border-neutral-250 last:border-0 ${
                      isDefaultRole(role.name) ? 'bg-neutral-150' : ''
                    }`}
                  >
                    <div className="flex">
                      <Icon
                        name={
                          !isDefaultRole(role.name) ? IconAwesomeEnum.USER : RolesIcons[role.name?.toUpperCase() || '']
                        }
                        className="text-brand-500"
                      />
                      <div className="ml-4">
                        <h2 className="flex text-xs text-neutral-400 font-medium">
                          {isDefaultRole(role.name) ? upperCaseFirstLetter(role.name) : role.name}
                        </h2>
                        <p className="text-xs text-neutral-350 mt-1">
                          {isDefaultRole(role.name) ? 'Basic Role' : 'Custom Role'}
                        </p>
                      </div>
                    </div>
                    {!isDefaultRole(role.name) ? (
                      <div data-testid={`role-actions-${role.id}`}>
                        <ButtonIcon
                          icon={IconAwesomeEnum.WHEEL}
                          style={ButtonIconStyle.STROKED}
                          size={ButtonSize.TINY}
                          onClick={() => navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_EDIT_URL(role.id)}`)}
                          className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8 mr-2"
                          iconClassName="!text-xs"
                        />
                        <ButtonIcon
                          icon={IconAwesomeEnum.TRASH}
                          style={ButtonIconStyle.STROKED}
                          size={ButtonSize.TINY}
                          onClick={() => onDeleteRole(role)}
                          className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8"
                          iconClassName="!text-xs"
                        />
                      </div>
                    ) : (
                      <div data-testid={`role-doc-${role.id}`}>
                        <ButtonIcon
                          icon={IconAwesomeEnum.BOOK}
                          style={ButtonIconStyle.STROKED}
                          size={ButtonSize.TINY}
                          className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8"
                          iconClassName="!text-xs"
                          link="https://hub.qovery.com/docs/using-qovery/configuration/organization/#roles-based-access-control-rbac"
                          external
                        />
                      </div>
                    )}
                  </div>
                ))}
            </BlockContent>
          )
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/members-rbac/#roles-based-access-control-rbac',
            linkLabel: 'How to configure my custom roles',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationRoles
