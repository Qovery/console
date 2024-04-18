import { type Dispatch, type SetStateAction, memo, useState } from 'react'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { type EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { Table, type TableFilterProps, type TableHeadProps } from '@qovery/shared/ui'
import TableRowEnvironmentVariableFeature from '../../feature/table-row-environment-variable-feature/table-row-environment-variable-feature'

export interface PageVariablesProps {
  tableHead: TableHeadProps<EnvironmentVariableSecretOrPublic>[]
  variables: EnvironmentVariableSecretOrPublic[]
  setData: Dispatch<SetStateAction<EnvironmentVariableSecretOrPublic[]>>
  isLoading: boolean
  serviceType?: ServiceType
}

export function PageVariablesMemo(props: PageVariablesProps) {
  const { setData, tableHead, variables } = props
  const columnsWidth = '30% 20% 22% 13% 15%'

  const [filter, setFilter] = useState<TableFilterProps[]>([])

  return (
    <Table
      dataHead={tableHead}
      data={variables}
      setDataSort={setData}
      setFilter={setFilter}
      filter={filter}
      className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
      columnsWidth={columnsWidth}
    >
      <>
        {variables.map((envVariable) => (
          <TableRowEnvironmentVariableFeature
            key={envVariable.id}
            filter={filter}
            variable={envVariable}
            dataHead={tableHead}
            columnsWidth={columnsWidth}
            isLoading={props.isLoading}
            serviceType={props.serviceType}
          />
        ))}
      </>
    </Table>
  )
}

export const PageVariables = memo(PageVariablesMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior and so many value are necessary because updated_at is not
  // updated during an import... Problem from backend.
  const prevPropsIds = prevProps.variables.map((envVariables) => ({
    id: envVariables.id,
    updated_at: envVariables.updated_at,
    key: envVariables.key,
    value: envVariables.value || '',
  }))
  const nextPropsIds = nextProps.variables.map((envVariables) => ({
    id: envVariables.id,
    updated_at: envVariables.updated_at,
    key: envVariables.key,
    value: envVariables.value || '',
  }))

  return JSON.stringify(prevPropsIds) === JSON.stringify(nextPropsIds)
})

export default PageVariables
