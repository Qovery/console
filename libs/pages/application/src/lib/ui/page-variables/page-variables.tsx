import { HelpSection, Table, TableHeadProps } from '@console/shared/ui'
import TableRowEnvironmentVariableFeature from '../../feature/table-row-environment-variable-feature/table-row-environment-variable-feature'
import { EnvironmentVariableSecretOrPublic } from '@console/shared/interfaces'
import React, { Dispatch, SetStateAction } from 'react'

export interface PageVariablesProps {
  tableHead: TableHeadProps[]
  variables: EnvironmentVariableSecretOrPublic[]
  setFilterData: Dispatch<SetStateAction<EnvironmentVariableSecretOrPublic[]>>
  filterData: EnvironmentVariableSecretOrPublic[]
  isLoading: boolean
}

export function PageVariablesMemo(props: PageVariablesProps) {
  const { tableHead, variables, setFilterData, filterData } = props
  const columnsWidth = '30% 20% 25% 10% 15%'

  return (
    <>
      <Table
        dataHead={tableHead}
        defaultData={variables}
        filterData={filterData}
        setFilterData={setFilterData}
        className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
        columnsWidth={columnsWidth}
      >
        <>
          {filterData.map((envVariable) => (
            <TableRowEnvironmentVariableFeature
              key={envVariable.id}
              variable={envVariable}
              dataHead={tableHead}
              columnsWidth={columnsWidth}
              isLoading={props.isLoading}
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
    </>
  )
}

export const PageVariables = React.memo(PageVariablesMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  const prevProsIds = prevProps.filterData.map((envVariables) => ({
    id: envVariables.id,
    updated_at: envVariables.updated_at,
  }))
  const nextPropsIds = nextProps.filterData.map((envVariables) => ({
    id: envVariables.id,
    updated_at: envVariables.updated_at,
  }))

  return JSON.stringify(prevProsIds) === JSON.stringify(nextPropsIds)
})

export default PageVariables
