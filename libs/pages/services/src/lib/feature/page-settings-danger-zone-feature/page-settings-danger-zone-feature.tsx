import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import { deleteEnvironmentAction } from '@console/domains/environment'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@console/shared/router'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const deleteEnvironment = async () => {
    const result = await dispatch(deleteEnvironmentAction({ projectId, environmentId }))
    if (result.payload.status === 204) {
      navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL)
    }
  }

  return <PageSettingsDangerZone deleteEnvironment={deleteEnvironment} />
}

export default PageSettingsDangerZoneFeature
