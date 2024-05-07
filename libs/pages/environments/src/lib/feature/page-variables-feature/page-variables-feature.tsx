import { useParams } from 'react-router-dom'
import { VariableList } from '@qovery/domains/variables/feature'
import { toast } from '@qovery/shared/ui'

export function PageVariablesFeature() {
  const { projectId = '' } = useParams()

  return (
    <div className="mt-2 bg-white rounded-sm flex flex-1">
      <VariableList
        className="border-b border-b-neutral-200"
        scope="PROJECT"
        projectId={projectId}
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
  )
}

export default PageVariablesFeature
