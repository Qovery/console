import { useParams } from 'react-router-dom'
import { useDeployEnvironment } from '@qovery/domains/environments/feature'
import { VariableList } from '@qovery/domains/variables/feature'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { toast } from '@qovery/shared/ui'

export function PageVariablesFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId),
  })

  const toasterCallback = () => {
    deployEnvironment({ environmentId })
  }

  return (
    <div className="mt-2 bg-white rounded-sm flex flex-1">
      <div className="grow">
        <VariableList
          className="border-b border-b-neutral-200"
          currentScope="ENVIRONMENT"
          parentId={environmentId}
          onCreateVariable={() => {
            toast(
              'SUCCESS',
              'Creation success',
              'You need to redeploy your environment for your changes to be applied.',
              toasterCallback,
              undefined,
              'Redeploy'
            )
          }}
          onEditVariable={() => {
            toast(
              'SUCCESS',
              'Edition success',
              'You need to redeploy your environment for your changes to be applied.',
              toasterCallback,
              undefined,
              'Redeploy'
            )
          }}
          onDeleteVariable={(variable) => {
            let name = variable.key
            if (name && name.length > 30) {
              name = name.substring(0, 30) + '...'
            }
            toast(
              'SUCCESS',
              'Deletion success',
              `${name} has been deleted. You need to redeploy your environment for your changes to be applied.`,
              toasterCallback,
              undefined,
              'Redeploy'
            )
          }}
        />
      </div>
    </div>
  )
}

export default PageVariablesFeature
