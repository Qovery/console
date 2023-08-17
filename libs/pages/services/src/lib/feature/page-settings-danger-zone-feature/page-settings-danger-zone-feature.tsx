import { StateEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteEnvironment, useFetchEnvironment } from '@qovery/domains/environment'
import { useDeploymentStatus } from '@qovery/domains/environments/feature'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@qovery/shared/routes'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId })
  const deleteEnvironment = useDeleteEnvironment(
    projectId,
    environmentId,
    () => navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL),
    deploymentStatus?.state === StateEnum.READY
  )

  return <PageSettingsDangerZone deleteEnvironment={() => deleteEnvironment.mutate()} environment={environment} />
}

export default PageSettingsDangerZoneFeature
