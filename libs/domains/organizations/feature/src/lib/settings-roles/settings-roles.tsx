import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useParams } from '@tanstack/react-router'
import { type OrganizationAvailableRole, type OrganizationCustomRole } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { MemberRoleEnum } from '@qovery/shared/enums'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { BlockContent, Button, ExternalLink, Icon, Link, Section, Skeleton } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useAvailableRoles } from '../hooks/use-available-roles/use-available-roles'
import { useDeleteCustomRole } from '../hooks/use-delete-custom-role/use-delete-custom-role'
import CreateModalFeature from './create-modal/create-modal'

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

interface RolesTableProps {
  organizationId: string
  onDeleteRole: (customRole: OrganizationCustomRole) => void
}

function RolesTable({ organizationId, onDeleteRole }: RolesTableProps) {
  const { data: availableRoles = [] } = useAvailableRoles({ organizationId, suspense: true })

  return (
    availableRoles.length > 0 && (
      <BlockContent title="Roles" className="overflow-hidden" classNameContent="p-0">
        {rolesSort(availableRoles)?.map((role: OrganizationAvailableRole) => (
          <div
            data-testid={`role-${role.id}`}
            key={role.id}
            className={`flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0 ${
              isDefaultRole(role.name) ? 'bg-surface-neutral-component' : ''
            }`}
          >
            <div className="flex items-center gap-5">
              <Icon
                iconName={!isDefaultRole(role.name) ? 'user' : RolesIcons[role.name?.toUpperCase() || '']}
                iconStyle="regular"
                className="text-neutral-subtle"
              />
              <div>
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
                  to="/organization/$organizationId/settings/roles/edit/$roleId"
                  params={{
                    organizationId,
                    roleId: role.id,
                  }}
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
  )
}

const RolesTableSkeleton = () => (
  <BlockContent title="Roles" className="overflow-hidden" classNameContent="p-0">
    {[0, 1, 2, 3].map((index) => (
      <div key={index} className="flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0">
        <div className="flex items-center gap-5">
          <Skeleton rounded width={20} height={20} show={true} />
          <div className="space-y-2">
            <Skeleton width={140} height={12} show={true} />
            <Skeleton width={90} height={12} show={true} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton width={36} height={36} show={true} />
          <Skeleton width={36} height={36} show={true} />
        </div>
      </div>
    ))}
  </BlockContent>
)

export function SettingsRoles() {
  const { organizationId = '' } = useParams({ strict: false })

  useDocumentTitle('Roles & permissions - Organization settings')

  const { mutateAsync: deleteCustomRole } = useDeleteCustomRole()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const onAddRole = () => {
    openModal({
      content: <CreateModalFeature organizationId={organizationId} onClose={closeModal} />,
    })
  }

  const onDeleteRole = (customRole: OrganizationCustomRole) => {
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
  }

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
          <Suspense fallback={<RolesTableSkeleton />}>
            <RolesTable organizationId={organizationId} onDeleteRole={onDeleteRole} />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
