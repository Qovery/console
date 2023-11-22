import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteProject, useProject } from '@qovery/domains/projects/feature'
import { SETTINGS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageProjectDangerZone from '../../ui/page-project-danger-zone/page-project-danger-zone'

export function PageProjectDangerZoneFeature() {
  const { organizationId = '', projectId = '' } = useParams()
  useDocumentTitle('Danger zone - Project settings')

  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const { data: project } = useProject({ organizationId, projectId })
  const { mutateAsync } = useDeleteProject()

  const deleteProjectAction = async () => {
    setLoading(true)

    try {
      await mutateAsync({
        organizationId,
        projectId,
      })
      setLoading(false)
      navigate(SETTINGS_URL(organizationId))
    } catch (error) {
      console.error(error)
    }
  }

  return <PageProjectDangerZone deleteProject={deleteProjectAction} project={project} loading={loading} />
}

export default PageProjectDangerZoneFeature
