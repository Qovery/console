import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { useProject } from '@qovery/domains/projects/feature'
import { deleteProject } from '@qovery/project'
import { SETTINGS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch } from '@qovery/state/store'
import PageProjectDangerZone from '../../ui/page-project-danger-zone/page-project-danger-zone'

export function PageProjectDangerZoneFeature() {
  const { organizationId = '', projectId = '' } = useParams()
  useDocumentTitle('Danger zone - Project settings')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const { data: project } = useProject({ projectId })

  const deleteProjectAction = () => {
    setLoading(true)

    dispatch(deleteProject({ projectId }))
      .unwrap()
      .then(() => {
        setLoading(false)
        navigate(SETTINGS_URL(organizationId))
      })
  }

  return <PageProjectDangerZone deleteProject={deleteProjectAction} project={project} loading={loading} />
}

export default PageProjectDangerZoneFeature
