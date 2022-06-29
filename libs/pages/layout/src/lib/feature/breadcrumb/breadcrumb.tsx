/* eslint-disable-next-line */
import { Breadcrumb } from '@console/shared/ui'
import { useSelector } from 'react-redux'
import { selectAllOrganization, selectClustersEntitiesByOrganizationId } from '@console/domains/organization'
import { RootState } from '@console/store/data'
import { selectApplicationsEntitiesByEnvId } from '@console/domains/application'
import { useParams } from 'react-router-dom'
import { selectDatabasesEntitiesByEnvId } from '@console/domains/database'
import { selectEnvironmentsEntitiesByProjectId } from '@console/domains/environment'
import { selectProjectsEntitiesByOrgId } from '@console/domains/projects'

export function BreadcrumbFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const organizations = useSelector(selectAllOrganization)
  const clusters = useSelector((state: RootState) => selectClustersEntitiesByOrganizationId(state, organizationId))
  const applications = useSelector((state: RootState) => selectApplicationsEntitiesByEnvId(state, environmentId))
  const databases = useSelector((state: RootState) => selectDatabasesEntitiesByEnvId(state, environmentId))
  const environments = useSelector((state: RootState) => selectEnvironmentsEntitiesByProjectId(state, projectId))
  const projects = useSelector((state: RootState) => selectProjectsEntitiesByOrgId(state, organizationId))

  return (
    <Breadcrumb
      clusters={clusters}
      organizations={organizations}
      applications={applications}
      databases={databases}
      environments={environments}
      projects={projects}
    />
  )
}

export default Breadcrumb
