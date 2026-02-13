import { useNavigate, useParams } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL, OVERVIEW_URL } from '@qovery/shared/routes'
import { BlockContentDelete } from '@qovery/shared/ui'
import { useDeleteEnvironment } from '../hooks/use-delete-environment/use-delete-environment'
import { useEnvironment } from '../hooks/use-environment/use-environment'

interface PageSettingsDangerZoneProps {
  deleteEnvironment: () => Promise<void>
  environment?: Environment
}

export function PageSettingsDangerZone(props: PageSettingsDangerZoneProps) {
  const { deleteEnvironment, environment } = props

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Delete Environment"
          list={[
            {
              text: 'Databases',
            },
            {
              text: 'Applications',
            },
          ]}
          ctaLabel="Delete environment"
          callback={deleteEnvironment}
          modalConfirmation={{
            mode: environment?.mode,
            title: 'Delete environment',
            name: environment?.name,
          }}
        />
      </div>
    </div>
  )
}

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: environment } = useEnvironment({ environmentId })
  const { mutateAsync: deleteEnvironment } = useDeleteEnvironment({
    projectId,
    logsLink: ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL,
  })

  return (
    <PageSettingsDangerZone
      deleteEnvironment={async () => {
        try {
          await deleteEnvironment({ environmentId })
          navigate({ to: OVERVIEW_URL(organizationId, projectId) })
        } catch (error) {
          // Errors are handled by the mutation's notifyOnError.
        }
      }}
      environment={environment}
    />
  )
}
