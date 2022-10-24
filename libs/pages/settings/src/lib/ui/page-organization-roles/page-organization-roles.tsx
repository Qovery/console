import { OrganizationCustomRole } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { SETTINGS_ROLES_EDIT_URL, SETTINGS_URL } from '@qovery/shared/router'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  LoaderSpinner,
} from '@qovery/shared/ui'

export interface PageOrganizationRolesEditProps {
  onAddRole: () => void
  onDeleteRole: (customRole: OrganizationCustomRole) => void
  customRoles?: OrganizationCustomRole[]
  loading?: LoadingStatus
}

export function PageOrganizationRolesEdit(props: PageOrganizationRolesEditProps) {
  const { customRoles, loading, onAddRole, onDeleteRole } = props

  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-between w-full max-w-content-with-navigation-left">
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
        {loading === 'not loaded' || loading === 'loading' ? (
          <div data-testid="custom-roles-loader" className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : customRoles && customRoles.length > 0 ? (
          <BlockContent title="Custom roles" classNameContent="">
            {customRoles?.map((role: OrganizationCustomRole) => (
              <div
                data-testid={`registries-list-${role.id}`}
                key={role.id}
                className="flex justify-between items-center px-5 py-4 border-b border-element-light-lighter-500 last:border-0"
              >
                <div>
                  <h2 className="flex text-xs text-text-600 font-medium">{role.name}</h2>
                  {role.description && <p className="text-xs text-text-400 mt-1">{role.description}</p>}
                </div>
                <div>
                  <ButtonIcon
                    icon={IconAwesomeEnum.WHEEL}
                    style={ButtonIconStyle.STROKED}
                    size={ButtonSize.TINY}
                    onClick={() => navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_ROLES_EDIT_URL(role.id)}`)}
                    className="text-text-400 hover:text-text-500 bg-transparent !w-9 !h-8 mr-2"
                    iconClassName="!text-xs"
                  />
                  <ButtonIcon
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.STROKED}
                    size={ButtonSize.TINY}
                    onClick={() => onDeleteRole(role)}
                    className="text-text-400 hover:text-text-500 bg-transparent !w-9 !h-8"
                    iconClassName="!text-xs"
                  />
                </div>
              </div>
            ))}
          </BlockContent>
        ) : loading === 'loaded' && customRoles?.length === 0 ? (
          <EmptyState dataTestId="empty-state" title="Create your first custom role" imageWidth="w-[160px]">
            <Button className="mt-5" onClick={onAddRole}>
              Add new role
            </Button>
          </EmptyState>
        ) : null}
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

export default PageOrganizationRolesEdit
