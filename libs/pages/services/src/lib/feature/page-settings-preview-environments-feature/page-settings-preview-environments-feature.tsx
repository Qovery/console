import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { EnvironmentEntity } from '@console/shared/interfaces'
import { RootState } from '@console/store/data'
import { selectEnvironmentById } from '@console/domains/environment'
import PageSettingsPreviewEnvironments from '../../ui/page-settings-preview-environments/page-settings-preview-environments'

export function PageSettingsPreviewEnvironmentsFeature() {
  const { environmentId = '' } = useParams()
  // const dispatch = useDispatch<AppDispatch>()
  const environment = useSelector<RootState, EnvironmentEntity | undefined>((state) =>
    selectEnvironmentById(state, environmentId)
  )

  return <PageSettingsPreviewEnvironments environment={environment} />
}

export default PageSettingsPreviewEnvironmentsFeature
