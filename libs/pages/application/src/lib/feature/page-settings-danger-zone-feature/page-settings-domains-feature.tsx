import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import PageSettingsDomains from '../../ui/page-settings-domains/page-settings-domains'

export function PageSettingsDomainsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  return <PageSettingsDomains />
}

export default PageSettingsDomainsFeature
