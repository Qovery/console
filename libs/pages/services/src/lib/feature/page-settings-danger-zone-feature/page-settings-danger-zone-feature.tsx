import { useParams } from 'react-router-dom'
import { useDeleteEnvironment, useEnvironment } from '@qovery/domains/environments/feature'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { mutate: deleteEnvironment } = useDeleteEnvironment({
    projectId,
    logsLink: ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL,
  })

  return (
    <PageSettingsDangerZone deleteEnvironment={() => deleteEnvironment({ environmentId })} environment={environment} />
  )
}

export default PageSettingsDangerZoneFeature
