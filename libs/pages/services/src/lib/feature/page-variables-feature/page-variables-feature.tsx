import { useParams } from 'react-router-dom'
import { VariableList } from '@qovery/domains/variables/feature'

export function PageVariablesFeature() {
  const { environmentId = '' } = useParams()

  return (
    <div className="mt-2 bg-white rounded-sm flex flex-1">
      <div className="grow">
        <VariableList
          className="border-b border-b-neutral-200"
          showAll={false}
          currentScope="ENVIRONMENT"
          parentId={environmentId}
          onCreateVariable={(variable, variableType) => {}}
          onEditVariable={(variable) => {}}
          onDeleteVariable={(variable) => {}}
        />
      </div>
    </div>
  )
}

export default PageVariablesFeature
