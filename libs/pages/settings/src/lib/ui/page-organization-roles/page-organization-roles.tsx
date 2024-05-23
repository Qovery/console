import { type OrganizationAvailableRole, type OrganizationCustomRole } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { MemberRoleEnum } from '@qovery/shared/enums'
import { SETTINGS_ROLES_EDIT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Button,
  ExternalLink,
  Heading,
  Icon,
  IconAwesomeEnum,
  Link,
  LoaderSpinner,
  Section,
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

  return (
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between">
      <Section className="p-8">
        <div className="mb-8 flex justify-between">
          <div>
            <Heading className="mb-2">Manage your roles</Heading>
            <p className="text-xs text-neutral-400">Manage the existing custom roles or create a new one.</p>
          </div>
          <Button onClick={onAddRole} className="gap-2" size="lg">
            Add new role
            <Icon iconName="circle-plus" />
          </Button>
        </div>
        {(!roles || roles.length === 0) && loading ? (
          <div data-testid="roles-loader" className="mt-5 flex justify-center">
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
                    className={`flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0 ${
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
                        <h2 className="flex text-xs font-medium text-neutral-400">
                          {isDefaultRole(role.name) ? upperCaseFirstLetter(role.name) : role.name}
                        </h2>
                        <p className="mt-1 text-xs text-neutral-350">
                          {isDefaultRole(role.name) ? 'Basic Role' : 'Custom Role'}
                        </p>
                      </div>
                    </div>
                    {!isDefaultRole(role.name) ? (
                      <div data-testid={`role-actions-${role.id}`} className="flex gap-2">
                        <Link
                          as="button"
                          variant="outline"
                          color="neutral"
                          size="md"
                          to={`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_EDIT_URL(role.id)}`}
                        >
                          <Icon iconName="gear" />
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          color="neutral"
                          size="md"
                          onClick={() => onDeleteRole(role)}
                        >
                          <Icon iconName="trash" />
                        </Button>
                      </div>
                    ) : (
                      <div data-testid={`role-doc-${role.id}`}>
                        <ExternalLink
                          as="button"
                          variant="outline"
                          color="neutral"
                          size="md"
                          href="https://hub.qovery.com/docs/using-qovery/configuration/organization/#roles-based-access-control-rbac"
                        >
                          <Icon iconName="book" />
                        </ExternalLink>
                      </div>
                    )}
                  </div>
                ))}
            </BlockContent>
          )
        )}
      </Section>
    </div>
  )
}

export default PageOrganizationRoles
