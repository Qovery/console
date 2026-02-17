import { useNavigate, useParams } from '@tanstack/react-router'
import { EnvironmentModeEnum, type Organization } from 'qovery-typescript-axios'
import { LOGOUT_URL } from '@qovery/shared/routes'
import { BlockContentDelete } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useDeleteOrganization } from '../hooks/use-delete-organization/use-delete-organization'
import { useOrganization } from '../hooks/use-organization/use-organization'
import { useOrganizations } from '../hooks/use-organizations/use-organizations'

export interface PageOrganizationDangerZoneProps {
  deleteOrganization: () => void
  loading: boolean
  organization?: Organization
}

export function PageOrganizationDangerZone(props: PageOrganizationDangerZoneProps) {
  const { deleteOrganization, organization, loading } = props
  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Delete organization"
          ctaLabel="Delete organization"
          ctaLoading={loading}
          list={[
            {
              iconName: 'trash',
              iconStyle: 'solid',
              text: 'Databases',
            },
            {
              iconName: 'trash',
              iconStyle: 'solid',
              text: 'Applications',
            },
            {
              iconName: 'trash',
              iconStyle: 'solid',
              text: 'Github connection',
            },
            {
              iconName: 'trash',
              iconStyle: 'solid',
              text: 'Link cloud providers',
            },
          ]}
          callback={deleteOrganization}
          modalConfirmation={{
            mode: EnvironmentModeEnum.PRODUCTION,
            title: 'Delete organization',
            name: organization?.name,
          }}
        />
      </div>
    </div>
  )
}

export function SettingsDangerZone() {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: organizations = [] } = useOrganizations()
  useDocumentTitle('Danger zone - Organization settings')

  const navigate = useNavigate()

  const { data: organization } = useOrganization({ organizationId })
  const { mutateAsync: deleteOrganization, isLoading: isLoadingDeleteOrganization } = useDeleteOrganization()

  const deleteOrganizationAction = async () => {
    try {
      await deleteOrganization({
        organizationId,
      })
      if (organizations.length === 1) {
        await navigate(LOGOUT_URL)
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <PageOrganizationDangerZone
      deleteOrganization={deleteOrganizationAction}
      organization={organization}
      loading={isLoadingDeleteOrganization}
    />
  )
}
