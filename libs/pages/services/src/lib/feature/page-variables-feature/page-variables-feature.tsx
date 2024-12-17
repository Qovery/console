import { useParams } from 'react-router-dom'
import { useDeployEnvironment } from '@qovery/domains/environments/feature'
import { VariableList } from '@qovery/domains/variables/feature'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
import { toast } from '@qovery/shared/ui'

export function PageVariablesFeature() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { mutate: deployEnvironment } = useDeployEnvironment({
    projectId,
    logsLink: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL(),
  })

  const toasterCallback = () => {
    deployEnvironment({ environmentId })
  }

  return (
    <VariableList
      className="border-b border-b-neutral-200"
      scope="ENVIRONMENT"
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
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
  )
}

export default PageVariablesFeature
