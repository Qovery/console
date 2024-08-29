import { useParams } from 'react-router-dom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useEnvironments } from '@qovery/domains/environments/feature'
import { useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { CreateProjectModal } from '@qovery/domains/projects/feature'
import { useModal } from '@qovery/shared/ui'
import { BreadcrumbMemo } from '../../ui/breadcrumb/breadcrumb'

export function BreadcrumbFeature() {
  const { organizationId = '', projectId = '', clusterId } = useParams()
  const { data: organizations = [] } = useOrganizations()
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })
  const { data: clusters } = useClusters({ organizationId, enabled: !!organizationId })

  const { data: projects = [] } = useProjects({ organizationId, enabled: !clusterId })
  const { data: environments } = useEnvironments({ projectId })

  const { openModal, closeModal } = useModal()

  const createProjectModal = () => {
    openModal({
      content: <CreateProjectModal onClose={closeModal} organizationId={organizationId} />,
    })
  }

  // Necessary to keep the organization from client by Qovery team
  const allOrganizations =
    organizations.find((org) => org.id !== organizationId) && organization
      ? [...organizations, organization]
      : organizations

  return (
    <BreadcrumbMemo
      clusters={clusters}
      organizations={allOrganizations}
      environments={environments}
      projects={projects}
      createProjectModal={createProjectModal}
    />
  )
}

export default BreadcrumbFeature
