import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ApplicationEntity, EnvironmentEntity } from '@console/shared/interfaces'
import { AppDispatch, RootState } from '@console/store/data'
import { selectEnvironmentById } from '@console/domains/environment'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@console/shared/router'
import { deleteApplicationAction, selectApplicationById } from '@console/domains/application'
import PageSettingsDangerZone from '../../ui/page-settings-danger-zone/page-settings-danger-zone'

export function PageSettingsDangerZoneFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )
  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  const deleteApplication = () => {
    dispatch(deleteApplicationAction({ environmentId, applicationId }))
      .unwrap()
      .then(() => navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL))
  }

  return (
    <PageSettingsDangerZone
      deleteApplication={deleteApplication}
      application={application}
      environmentMode={environment?.mode}
    />
  )
}

export default PageSettingsDangerZoneFeature
