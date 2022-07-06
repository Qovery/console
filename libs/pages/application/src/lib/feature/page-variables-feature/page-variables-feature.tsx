import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { useEffect, useState } from 'react'
import {
  fetchEnvironmentVariables,
  fetchSecretEnvironmentVariables,
  selectEnvironmentVariablesByApplicationId,
  selectSecretEnvironmentVariablesByApplicationId,
} from '@console/domains/environment-variable'
import { useParams } from 'react-router'
import { BaseLink, TableHeadProps } from '@console/shared/ui'
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  SecretEnvironmentVariableEntity,
} from '@console/shared/interfaces'
import { useDocumentTitle } from '@console/shared/utils'
import PageVariables from '../../ui/page-variables/page-variables'

export function PageVariablesFeature() {
  useDocumentTitle('Environment Variables – Qovery')
  const dispatch = useDispatch<AppDispatch>()
  const { applicationId = '' } = useParams()
  const [data, setData] = useState<EnvironmentVariableSecretOrPublic[]>([])

  const environmentVariables = useSelector<RootState, EnvironmentVariableEntity[]>(
    (state) => selectEnvironmentVariablesByApplicationId(state, applicationId),
    shallowEqual
  )
  const secretEnvironmentVariables = useSelector<RootState, SecretEnvironmentVariableEntity[]>(
    (state) => selectSecretEnvironmentVariablesByApplicationId(state, applicationId),
    shallowEqual
  )

  useEffect(() => {
    dispatch(fetchEnvironmentVariables(applicationId))
    dispatch(fetchSecretEnvironmentVariables(applicationId))
  }, [dispatch, applicationId])

  useEffect(() => {
    setData([...environmentVariables, ...secretEnvironmentVariables])
  }, [environmentVariables, secretEnvironmentVariables])

  const tableHead: TableHeadProps[] = [
    {
      title: `${data.length} variable${data.length > 1 ? 's' : ''}`,
      className: 'px-4 py-2',
    },
    {
      title: 'Update',
      className: 'pl-4 pr-12 text-end',
    },
    {
      title: 'Value',
      className: 'px-4 py-2 border-b-element-light-lighter-400 border-l h-full',
      filter: [
        {
          title: 'Sort by privacy',
          key: 'variable_type',
        },
      ],
    },
    {
      title: 'Service link',
    },
    {
      title: 'Scope',
      filter: [
        {
          title: 'Sort by scope',
          key: 'scope',
        },
      ],
    },
  ]

  const listHelpfulLinks: BaseLink[] = [
    {
      link: '#',
      linkLabel: 'How to configure my environment variables',
      external: true,
    },
  ]

  return (
    <PageVariables
      tableHead={tableHead}
      variables={[...environmentVariables, ...secretEnvironmentVariables]}
      setFilterData={setData}
      filterData={data}
      listHelpfulLinks={listHelpfulLinks}
    />
  )
}

export default PageVariablesFeature
