import { useParams } from 'react-router-dom'
import { VariableList } from '@qovery/domains/variables/feature'
import { toast } from '@qovery/shared/ui'

export function PageVariablesFeature() {
  const { projectId = '' } = useParams()

  return (
    <div className="mt-2 bg-white rounded-sm flex flex-1">
      <div className="grow">
        <VariableList
          className="border-b border-b-neutral-200"
          currentScope="PROJECT"
          parentId={projectId}
          onCreateVariable={() => {
            toast('SUCCESS', 'Creation success')
          }}
          onEditVariable={() => {
            toast('SUCCESS', 'Edition success')
          }}
          onDeleteVariable={() => {
            toast('SUCCESS', 'Deletion success')
          }}
        />
      </div>
    </div>
  )
}

export default PageVariablesFeature
