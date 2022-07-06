import { BaseLink, HelpSection, Table, TableHeadProps } from '@console/shared/ui'
import TableRowEnvironmentVariableFeature from '../../feature/table-row-environment-variable-feature/table-row-environment-variable-feature'
import { EnvironmentVariableSecretOrPublic } from '@console/shared/interfaces'
import React, { Dispatch, SetStateAction } from 'react'

export interface PageVariablesProps {
  tableHead: TableHeadProps[]
  variables: EnvironmentVariableSecretOrPublic[]
  setFilterData: Dispatch<SetStateAction<EnvironmentVariableSecretOrPublic[]>>
  filterData: EnvironmentVariableSecretOrPublic[]
  listHelpfulLinks: BaseLink[]
}

export function PageVariablesMemo(props: PageVariablesProps) {
  const { tableHead, variables, setFilterData, filterData, listHelpfulLinks } = props

  return (
    <>
      <Table
        dataHead={tableHead}
        defaultData={variables}
        filterData={filterData}
        setFilterData={setFilterData}
        className="mt-2 bg-white rounded-sm flex-grow overflow-y-auto min-h-0"
        columnsWidth="40% 15% 25% 10% 10%"
      >
        <>
          {filterData.map((envVariable) => (
            <TableRowEnvironmentVariableFeature key={envVariable.id} variable={envVariable} dataHead={tableHead} />
          ))}
        </>
      </Table>
      <div className="bg-white rounded-b flex flex-grow flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export const PageVariables = React.memo(PageVariablesMemo, (prevProps, nextProps) => {
  // Stringify is necessary to avoid Redux selector behavior
  const prevProsIds = prevProps.filterData.map((envVariables) => ({
    id: envVariables.id,
  }))
  const nextPropsIds = nextProps.filterData.map((envVariables) => ({
    id: envVariables.id,
  }))

  return JSON.stringify(prevProsIds) === JSON.stringify(nextPropsIds)
})

export default PageVariables
