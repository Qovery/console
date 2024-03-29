import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { useVariables } from '@qovery/domains/variables/feature'
import { environmentVariableFactoryMock } from '@qovery/shared/factories'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { type TableHeadProps } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ApplicationContext } from '../../ui/container/container'
import PageVariables from '../../ui/page-variables/page-variables'

const placeholder = environmentVariableFactoryMock(5) as EnvironmentVariableSecretOrPublic[]

export function PageVariablesFeature() {
  useDocumentTitle('Environment Variables – Qovery')
  const { environmentId, applicationId = '' } = useParams()

  const { data: service } = useService({
    environmentId,
    serviceId: applicationId,
  })

  const scope = match(service?.serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .otherwise(() => undefined)

  const { data: sortVariableMemo = [], isLoading } = useVariables({
    parentId: applicationId,
    scope,
  })

  const serviceType = service?.serviceType

  const [data, setData] = useState<EnvironmentVariableSecretOrPublic[]>(sortVariableMemo || placeholder)

  const { setShowHideAllEnvironmentVariablesValues } = useContext(ApplicationContext)

  useEffect(() => {
    setShowHideAllEnvironmentVariablesValues(false)
  }, [applicationId, serviceType])

  useEffect(() => {
    if (isLoading) {
      setData(placeholder)
    } else {
      // XXX: This should be done using `useMutationState` in tanstack-query v5 (we are currently still in v4)
      // https://tanstack.com/query/v5/docs/react/guides/optimistic-updates
      setData((previousData) =>
        previousData.length === 0 || previousData === placeholder
          ? sortVariableMemo
          : sortVariableMemo.map((variable) => ({
              ...variable,
              is_new: !previousData.find((v) => v.key === variable.key),
            }))
      )
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
              variable_kind: variable.is_secret ? ('secret' as const) : ('public' as const),
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
