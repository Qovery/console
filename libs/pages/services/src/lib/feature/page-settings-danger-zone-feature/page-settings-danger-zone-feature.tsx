import { useNavigate, useParams } from 'react-router-dom'
import { getEnvironmentById, useDeleteEnvironment, useFetchEnvironments } from '@qovery/domains/environment'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const { data: environments } = useFetchEnvironments(projectId)
  const environment = getEnvironmentById(environmentId, environments)
  const deleteEnvironment = useDeleteEnvironment(projectId, environmentId, () =>
    navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL)
  )

  return <PageSettingsDangerZone deleteEnvironment={() => deleteEnvironment.mutate()} environment={environment} />
}

export default PageSettingsDangerZoneFeature
