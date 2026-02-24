import { useParams } from '@tanstack/react-router'
import { type OrganizationAvailableRole, type OrganizationCustomRole } from 'qovery-typescript-axios'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { MemberRoleEnum } from '@qovery/shared/enums'
import { SETTINGS_ROLES_EDIT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { BlockContent, Button, ExternalLink, Icon, Link, LoaderSpinner, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useAvailableRoles } from '../hooks/use-available-roles/use-available-roles'
import { useDeleteCustomRole } from '../hooks/use-delete-custom-role/use-delete-custom-role'
import CreateModalFeature from './create-modal-feature/create-modal-feature'

interface PageOrganizationRolesProps {
  onAddRole: () => void
  onDeleteRole: (customRole: OrganizationCustomRole) => void
  loading: boolean
  roles?: OrganizationAvailableRole[]
}

const isDefaultRole = (role?: string) => role && role.toUpperCase() in MemberRoleEnum

const rolesSort = (roles: OrganizationAvailableRole[]) => {
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

const RolesIcons: { [key: string]: IconName } = {
  ADMIN: 'crown',
  BILLING: 'wallet',
  DEVOPS: 'gear',
  VIEWER: 'eye',
}

function PageOrganizationRoles(props: PageOrganizationRolesProps) {
  const { roles, onAddRole, onDeleteRole, loading } = props

  const { organizationId = '' } = useParams({ strict: false })

  return (
    <div className="w-full">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading
            title="Manage your roles"
            description="Manage the existing custom roles or create a new one."
          />

          <Button className="absolute right-0 top-0 gap-2" size="md" onClick={onAddRole}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add new role
          </Button>
        </div>

        <div className="max-w-content-with-navigation-left">
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
                      className={`flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0 ${
                        isDefaultRole(role.name) ? 'bg-surface-neutral-component' : ''
                      }`}
                    >
                      <div className="flex">
                        <Icon
                          iconName={!isDefaultRole(role.name) ? 'user' : RolesIcons[role.name?.toUpperCase() || '']}
                          iconStyle="regular"
                          className="text-neutral-subtle"
                        />
                        <div className="ml-4">
                          <h2 className="flex text-xs font-medium text-neutral">
                            {isDefaultRole(role.name) ? upperCaseFirstLetter(role.name) : role.name}
                          </h2>
                          <p className="mt-1 text-xs text-neutral-subtle">
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
                            iconOnly
                            size="md"
                            to={`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_EDIT_URL(role.id)}`}
                          >
                            <Icon iconName="gear" iconStyle="regular" />
                          </Link>
                          <Button
                            type="button"
                            variant="outline"
                            color="neutral"
                            iconOnly
                            size="md"
                            onClick={() => onDeleteRole(role)}
                          >
                            <Icon iconName="trash-can" iconStyle="regular" />
                          </Button>
                        </div>
                      ) : (
                        <div data-testid={`role-doc-${role.id}`}>
                          <ExternalLink
                            as="button"
                            variant="outline"
                            iconOnly
                            color="neutral"
                            size="md"
                            href="https://www.qovery.com/docs/configuration/organization/members-rbac"
                          >
                            <Icon iconName="book" iconStyle="regular" />
                          </ExternalLink>
                        </div>
                      )}
                    </div>
                  ))}
              </BlockContent>
            )
          )}
        </div>
      </Section>
    </div>
  )
}

export function SettingsRoles() {
  const { organizationId = '' } = useParams({ strict: false })

  useDocumentTitle('Roles & permissions - Organization settings')

  const { data: availableRoles = [], isLoading: isLoadingAvailableRoles } = useAvailableRoles({ organizationId })
  const { mutateAsync: deleteCustomRole } = useDeleteCustomRole()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageOrganizationRoles
      roles={availableRoles}
      loading={isLoadingAvailableRoles}
      onAddRole={() => {
        openModal({
          content: <CreateModalFeature organizationId={organizationId} onClose={closeModal} />,
        })
      }}
      onDeleteRole={(customRole: OrganizationCustomRole) => {
        openModalConfirmation({
          title: 'Delete custom role',
          confirmationMethod: 'action',
          description: 'Are you sure you want to delete this custom role?',
          name: customRole?.name,
          action: async () => {
            try {
              await deleteCustomRole({
                organizationId: organizationId,
                customRoleId: customRole.id ?? '',
              })
            } catch (error) {
              console.error(error)
            }
          },
        })
      }}
    />
  )
}
