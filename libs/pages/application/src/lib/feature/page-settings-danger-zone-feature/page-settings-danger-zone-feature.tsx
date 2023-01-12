import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteApplicationAction, selectApplicationById } from '@qovery/domains/application'
import { selectEnvironmentById } from '@qovery/domains/environment'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, EnvironmentEntity } from '@qovery/shared/interfaces'
import { SERVICES_GENERAL_URL, SERVICES_URL } from '@qovery/shared/routes'
import { AppDispatch, RootState } from '@qovery/store'
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
    if (application) {
      dispatch(deleteApplicationAction({ environmentId, applicationId, serviceType: getServiceType(application) }))
        .unwrap()
        .then(() => navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL))
    }
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
