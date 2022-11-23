import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  environmentFactoryMock,
  environmentsLoadingStatus,
  fetchEnvironmentsStatus,
  selectEnvironmentsEntitiesByProjectId,
} from '@qovery/domains/environment'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import { BaseLink } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { PageGeneral } from '../../ui/page-general/page-general'

export function PageGeneralFeature() {
  useDocumentTitle('Environments - Qovery')
  const { projectId = '' } = useParams()
  const loadingEnvironments = environmentFactoryMock(3, true)

  const loadingStatus = useSelector(environmentsLoadingStatus)

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

  return (
    <PageGeneral
      isLoading={loadingStatus === 'loading'}
      environments={loadingStatus !== 'loaded' ? loadingEnvironments : environments}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default PageGeneralFeature
