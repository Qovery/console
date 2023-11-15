import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { useFetchEnvironments } from '@qovery/domains/environment'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { CreateProjectModalFeature } from '@qovery/shared/console-shared'
import { useModal } from '@qovery/shared/ui'
import { type RootState } from '@qovery/state/store'
import { Breadcrumb } from '../../ui/breadcrumb/breadcrumb'

export function BreadcrumbFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { data: organizations = [] } = useOrganizations()
  const { data: organization } = useOrganization({ organizationId })
  const clusters = useSelector((state: RootState) => selectClustersEntitiesByOrganizationId(state, organizationId))
  const applications = useSelector((state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId))
  const databases = useSelector((state: RootState) => selectDatabasesEntitiesByEnvId(state, environmentId))

  const { data: projects = [] } = useProjects({ organizationId })
  const { data: environments } = useFetchEnvironments(projectId)

  const { openModal, closeModal } = useModal()

  const createProjectModal = () => {
    openModal({
      content: <CreateProjectModalFeature onClose={closeModal} organizationId={organizationId} />,
    })
  }

  // Necessary to keep the organization from client by Qovery team
  const allOrganizations =
    organizations.find((org) => org.id !== organizationId) && organization
      ? [...organizations, organization]
      : organizations

  return (
    <Breadcrumb
      clusters={clusters}
      organizations={allOrganizations}
      applications={applications}
      databases={databases}
      environments={environments}
      projects={projects}
      createProjectModal={createProjectModal}
    />
  )
}

export default Breadcrumb
