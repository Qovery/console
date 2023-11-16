import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { selectApplicationById } from '@qovery/domains/application'
import { useService } from '@qovery/domains/services/feature'
import { useVariables } from '@qovery/domains/variables/feature'
import { type ServiceTypeEnum, getServiceType } from '@qovery/shared/enums'
import { environmentVariableFactoryMock } from '@qovery/shared/factories'
import { type ApplicationEntity, type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { type TableHeadProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import { ApplicationContext } from '../../ui/container/container'
import PageVariables from '../../ui/page-variables/page-variables'

const placeholder = environmentVariableFactoryMock(5) as EnvironmentVariableSecretOrPublic[]

export function PageVariablesFeature() {
  useDocumentTitle('Environment Variables – Qovery')
  const dispatch = useDispatch<AppDispatch>()
  const { environmentId, applicationId = '' } = useParams()

  const { data: service } = useService({
    environmentId,
    serviceId: applicationId,
  })

  const scope = match(service?.serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', () => APIVariableScopeEnum.JOB)
    .otherwise(() => undefined)

  const { data: sortVariableMemo = [], isLoading } = useVariables({
    parentId: applicationId,
    scope,
  })

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  const serviceType: ServiceTypeEnum | undefined = application && getServiceType(application)

  const [data, setData] = useState<EnvironmentVariableSecretOrPublic[]>(sortVariableMemo || placeholder)

  const { setShowHideAllEnvironmentVariablesValues } = useContext(ApplicationContext)

  useEffect(() => {
    setShowHideAllEnvironmentVariablesValues(false)
  }, [dispatch, applicationId, serviceType])

  useEffect(() => {
    if (isLoading) {
      setData(placeholder)
    } else {
      setData(sortVariableMemo)
    }
  }, [sortVariableMemo, isLoading])

  const tableHead: TableHeadProps<EnvironmentVariableSecretOrPublic>[] = [
    {
      title: !isLoading ? `${data?.length} variable${data?.length && data.length > 1 ? 's' : ''}` : `0 variable`,
      className: 'px-4 py-2',
    },
    {
      title: 'Update',
      className: 'pl-4 pr-12 text-end',
    },
    {
      title: 'Value',
      className: 'px-4 py-2 border-b-neutral-200 border-l h-full',
      filter: [
        {
          title: 'Sort by privacy',
          key: 'variable_kind',
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
      variables={
        !isLoading
          ? data.map((variable) => ({
              ...variable,
              // XXX: this is needed to comply with the current table implementation.
              // It should be removed when migrating to tanstack-table
              variable_kind: variable.value === null ? ('secret' as const) : ('public' as const),
            }))
          : placeholder
      }
      setData={setData}
      isLoading={isLoading}
      serviceType={serviceType}
    />
  )
}

export default PageVariablesFeature
