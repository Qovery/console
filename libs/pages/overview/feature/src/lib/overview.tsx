import { useEffect } from 'react'
import { Overview } from '@console/pages/overview/ui'
import { useDocumentTitle } from '@console/shared/utils'
import { useProjects } from '@console/domains/projects'
import { useParams } from 'react-router'

export function OverviewPage() {
  useDocumentTitle('Overview - Qovery')
  const { projects, getProjects } = useProjects()

  const { organizationId } = useParams()

  useEffect(() => {
    organizationId && getProjects(organizationId)
  }, [getProjects, organizationId])

  return <Overview projects={projects} />
}

export default OverviewPage
