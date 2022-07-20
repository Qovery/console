import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import { deleteEnvironmentAction, selectEnvironmentById } from '@console/domains/environment'
import { ENVIRONMENTS_GENERAL_URL, ENVIRONMENTS_URL } from '@console/shared/router'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  const deleteEnvironment = () => {
    dispatch(deleteEnvironmentAction({ projectId, environmentId }))
      .unwrap()
      .then(() => navigate(ENVIRONMENTS_URL(organizationId, projectId) + ENVIRONMENTS_GENERAL_URL))
  }

  return <PageSettingsDangerZone deleteEnvironment={deleteEnvironment} environment={environment} />
}

export default PageSettingsDangerZoneFeature
