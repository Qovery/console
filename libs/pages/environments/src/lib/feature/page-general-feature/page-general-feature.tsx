import { Cluster } from 'qovery-typescript-axios'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  environmentsLoadingStatus,
  fetchEnvironmentsStatus,
  selectEnvironmentsEntitiesByProjectId,
} from '@qovery/domains/environment'
import { selectClustersEntitiesByOrganizationId } from '@qovery/domains/organization'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  useDocumentTitle('Environments - Qovery')
  const { organizationId = '', projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)

  const loadingStatus = useSelector(environmentsLoadingStatus)
  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchEnvironmentsStatusByInterval = setInterval(() => dispatch(fetchEnvironmentsStatus({ projectId })), 3000)
    return () => clearInterval(fetchEnvironmentsStatusByInterval)
  }, [dispatch, projectId])

  const environments = useSelector<RootState, EnvironmentEntity[]>((state) =>
    selectEnvironmentsEntitiesByProjectId(state, projectId)
  )

  const listHelpfulLinks: BaseLink[] = [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
      linkLabel: 'How to manage my environment',
      external: true,
    },
  ]

  const isLoading = useCallback(() => {
    // if at least one collection has value to display, we remove the loading state
    if (environments.length) {
      return false
    }

    // if the two collections are loaded, we remove the loading state
    return loadingStatus === 'loading'
  }, [environments.length, loadingStatus])

  return (
    <PageGeneral
      isLoading={isLoading()}
      environments={isLoading() ? loadingEnvironments : environments}
      listHelpfulLinks={listHelpfulLinks}
      clusterAvailable={clusters.length > 0}
    />
  )
}

export default PageGeneralFeature
