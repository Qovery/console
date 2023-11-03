import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { useFetchEnvironments } from '@qovery/domains/environment'
import { selectAllOrganization, selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { useProjects } from '@qovery/domains/projects/feature'
import { CreateProjectModalFeature } from '@qovery/shared/console-shared'
import { useModal } from '@qovery/shared/ui'
import { type RootState } from '@qovery/state/store'
import { Breadcrumb } from '../../ui/breadcrumb/breadcrumb'

export function BreadcrumbFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const organizations = useSelector(selectAllOrganization)
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

  return (
    <Breadcrumb
      clusters={clusters}
      organizations={organizations}
      applications={applications}
      databases={databases}
      environments={environments}
      projects={projects}
      createProjectModal={createProjectModal}
    />
  )
}

export default Breadcrumb
