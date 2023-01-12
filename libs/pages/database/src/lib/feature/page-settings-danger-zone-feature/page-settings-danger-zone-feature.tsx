import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteDatabaseAction, selectDatabaseById } from '@qovery/domains/database'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { DatabaseEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, databaseId))

  const deleteApplication = () => {
    dispatch(deleteDatabaseAction({ environmentId, databaseId }))
      .unwrap()
      .then(() => navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL))
  }

  return (
    <PageSettingsDangerZone
      deleteDatabase={deleteApplication}
      database={database}
      environmentMode={environment?.mode}
    />
  )
}

export default PageSettingsDangerZoneFeature
