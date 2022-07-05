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
import { BaseLink, HelpSection, Table, TableHeadProps } from '@console/shared/ui'
import {
  EnvironmentVariableEntity,
  EnvironmentVariableSecretOrPublic,
  SecretEnvironmentVariableEntity,
} from '@console/shared/interfaces'
import TableRowEnvironmentVariableFeature from '../table-row-environment-variable-feature/table-row-environment-variable-feature'

export function PageVariablesFeature() {
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
      sort: {
        key: 'updated_at',
      },
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
    <>
      <Table
        dataHead={tableHead}
        defaultData={[...environmentVariables, ...secretEnvironmentVariables]}
        filterData={data}
        setFilterData={setData}
        className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
        columnsWidth="30% 20% 25% 15% 10%"
      >
        <>
          {data.map((envVariable) => (
            <TableRowEnvironmentVariableFeature key={envVariable.id} variable={envVariable} dataHead={tableHead} />
          ))}
        </>
      </Table>
      <div className="bg-white rounded-b flex flex-grow flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
    // <div>
    //   <VariableTableHeadFeature />
    //
    //   <ul>
    //     {environmentVariables.map((env) => (
    //       <li key={env.key}>
    //         {env.key} - {env.value}
    //       </li>
    //     ))}
    //     {secretEnvironmentVariables.map((env) => (
    //       <li key={env.key}>
    //         {env.key} - {env.scope}
    //       </li>
    //     ))}
    //   </ul>
    // </div>
  )
}

export default PageVariablesFeature
