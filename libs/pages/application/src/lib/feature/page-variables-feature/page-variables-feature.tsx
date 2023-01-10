import { useContext, useEffect, useMemo, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationById } from '@qovery/domains/application'
import {
  fetchEnvironmentVariables,
  fetchSecretEnvironmentVariables,
  getEnvironmentVariablesState,
  getSecretEnvironmentVariablesState,
  selectEnvironmentVariablesByApplicationId,
  selectSecretEnvironmentVariablesByApplicationId,
} from '@qovery/domains/environment-variable'
import { ServiceTypeEnum, getServiceType } from '@qovery/shared/enums'
import { environmentVariableFactoryMock } from '@qovery/shared/factories'
import {
  ApplicationEntity,
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  LoadingStatus,
  SecretEnvironmentVariableEntity,
} from '@qovery/shared/interfaces'
import { TableHeadProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import { ApplicationContext } from '../../ui/container/container'
import PageVariables from '../../ui/page-variables/page-variables'
import { sortVariable } from './utils/sort-variable'

export function PageVariablesFeature() {
  useDocumentTitle('Environment Variables – Qovery')
  const dispatch = useDispatch<AppDispatch>()
  const { applicationId = '' } = useParams()
  const [placeholder] = useState(environmentVariableFactoryMock(5))

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  const serviceType: ServiceTypeEnum | undefined = application && getServiceType(application)

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

  const { setShowHideAllEnvironmentVariablesValues } = useContext(ApplicationContext)

  useEffect(() => {
    setShowHideAllEnvironmentVariablesValues(false)

    if (serviceType) {
      dispatch(fetchEnvironmentVariables({ applicationId, serviceType }))
      dispatch(fetchSecretEnvironmentVariables({ applicationId, serviceType }))
    }
  }, [dispatch, applicationId, serviceType])

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
      key={data.length}
      tableHead={tableHead}
      variables={!isLoading ? data : placeholder}
      setData={setData}
      isLoading={isLoading}
      serviceType={serviceType}
    />
  )
}

export default PageVariablesFeature
