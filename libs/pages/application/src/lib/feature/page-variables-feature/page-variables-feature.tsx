import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { useEffect, useMemo, useState } from 'react'
import {
  environmentVariableFactoryMock,
  fetchEnvironmentVariables,
  fetchSecretEnvironmentVariables,
  getEnvironmentVariablesState,
  getSecretEnvironmentVariablesState,
  selectEnvironmentVariablesByApplicationId,
  selectSecretEnvironmentVariablesByApplicationId,
} from '@console/domains/environment-variable'
import { useParams } from 'react-router'
import { TableHeadProps } from '@console/shared/ui'
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  LoadingStatus,
  SecretEnvironmentVariableEntity,
} from '@console/shared/interfaces'
import { useDocumentTitle } from '@console/shared/utils'
import PageVariables from '../../ui/page-variables/page-variables'
import { sortVariable } from './utils/sort-variable'
import { environmentVariableUiActions } from '@console/pages/application'

export function PageVariablesFeature() {
  useDocumentTitle('Environment Variables – Qovery')
  const dispatch = useDispatch<AppDispatch>()
  const { applicationId = '' } = useParams()
  const [placeholder] = useState(environmentVariableFactoryMock(5))

  const environmentVariables = useSelector<RootState, EnvironmentVariableEntity[]>(
    (state) => selectEnvironmentVariablesByApplicationId(state, applicationId),
    shallowEqual
  )
  const secretEnvironmentVariables = useSelector<RootState, SecretEnvironmentVariableEntity[]>(
    (state) => selectSecretEnvironmentVariablesByApplicationId(state, applicationId),
    shallowEqual
  )

  const environmentVariablesLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => getEnvironmentVariablesState(state).loadingStatus
  )

  const sortVariableMemo = useMemo(
    () => sortVariable(environmentVariables, secretEnvironmentVariables),
    [environmentVariables, secretEnvironmentVariables]
  )

  const isPublicEnvVariableLoading = useSelector<RootState, LoadingStatus>(
    (state) => getEnvironmentVariablesState(state).loadingStatus
  )
  const isSecretEnvVariableLoading = useSelector<RootState, LoadingStatus>(
    (state) => getSecretEnvironmentVariablesState(state).loadingStatus
  )

  const [data, setData] = useState<EnvironmentVariableSecretOrPublic[]>(sortVariableMemo || placeholder)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    dispatch(environmentVariableUiActions.toggleShowAll(false))
    dispatch(fetchEnvironmentVariables(applicationId))
    dispatch(fetchSecretEnvironmentVariables(applicationId))
  }, [dispatch, applicationId])

  useEffect(() => {
    setLoading(
      !(isPublicEnvVariableLoading === 'loaded' || isSecretEnvVariableLoading === 'loaded') &&
        !environmentVariables.length &&
        !secretEnvironmentVariables.length
    )
  }, [isPublicEnvVariableLoading, isSecretEnvVariableLoading])

  useEffect(() => {
    if (isLoading) {
      setData(placeholder)
    } else {
      setData(sortVariableMemo)
    }
  }, [
    environmentVariables,
    secretEnvironmentVariables,
    sortVariableMemo,
    placeholder,
    isLoading,
    environmentVariablesLoadingStatus,
  ])

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
      filter: [
        {
          title: 'Sort by service',
          key: 'service_name',
        },
      ],
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

  return (
    <PageVariables
      tableHead={tableHead}
      variables={!isLoading ? sortVariableMemo : placeholder}
      setFilterData={setData}
      filterData={data}
      isLoading={isLoading}
    />
  )
}

export default PageVariablesFeature
