import { useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteDatabaseAction, selectDatabaseById } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { type DatabaseEntity } from '@qovery/shared/interfaces'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const queryClient = useQueryClient()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { data: environment } = useFetchEnvironment(projectId, environmentId)
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, databaseId))

  const deleteApplication = () => {
    dispatch(deleteDatabaseAction({ environmentId, databaseId, queryClient }))
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
