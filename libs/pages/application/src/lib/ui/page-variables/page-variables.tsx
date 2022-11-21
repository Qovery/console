import React, { Dispatch, SetStateAction, useState } from 'react'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { EnvironmentVariableEntity, EnvironmentVariableSecretOrPublic } from '@qovery/shared/interfaces'
import { HelpSection, Table, TableFilterProps, TableHeadProps } from '@qovery/shared/ui'
import TableRowEnvironmentVariableFeature from '../../feature/table-row-environment-variable-feature/table-row-environment-variable-feature'

export interface PageVariablesProps {
  tableHead: TableHeadProps[]
  variables: EnvironmentVariableSecretOrPublic[]
  setData: Dispatch<SetStateAction<EnvironmentVariableSecretOrPublic[]>>
  isLoading: boolean
  serviceType?: ServiceTypeEnum
}

export function PageVariablesMemo(props: PageVariablesProps) {
  const { setData, tableHead, variables } = props
  const columnsWidth = '30% 20% 22% 13% 15%'

  const [filter, setFilter] = useState<TableFilterProps>({})

  return (
    <Table
      dataHead={tableHead}
      data={variables}
      setDataSort={setData}
      setFilter={setFilter}
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

        <div className="bg-white rounded-b flex flex-col justify-end">
          <HelpSection
            description="Need help? You may find these links useful"
            links={[
              {
                link: '#',
                linkLabel: 'How to configure my environment variables',
                external: true,
              },
            ]}
          />
        </div>
      </>
    </Table>
  )
}

export const PageVariables = React.memo(PageVariablesMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior and so many value are necessary because updated_at is not
  // updated during an import... Problem from backend.
  const prevPropsIds = prevProps.variables.map((envVariables) => ({
    id: envVariables.id,
    updated_at: envVariables.updated_at,
    key: envVariables.key,
    value: (envVariables as EnvironmentVariableEntity).value || '',
  }))
  const nextPropsIds = nextProps.variables.map((envVariables) => ({
    id: envVariables.id,
    updated_at: envVariables.updated_at,
    key: envVariables.key,
    value: (envVariables as EnvironmentVariableEntity).value || '',
  }))

  return JSON.stringify(prevPropsIds) === JSON.stringify(nextPropsIds)
})

export default PageVariables
