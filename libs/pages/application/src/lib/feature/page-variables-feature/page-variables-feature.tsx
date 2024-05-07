import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeployService, useService } from '@qovery/domains/services/feature'
import { VariableList } from '@qovery/domains/variables/feature'
import { toast } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageVariablesFeature() {
  useDocumentTitle('Environment Variables – Qovery')
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: service } = useService({
    environmentId,
    serviceId: applicationId,
  })

  const scope = match(service?.serviceType)
    .with('APPLICATION', () => APIVariableScopeEnum.APPLICATION)
    .with('CONTAINER', () => APIVariableScopeEnum.CONTAINER)
    .with('JOB', () => APIVariableScopeEnum.JOB)
    .with('HELM', () => APIVariableScopeEnum.HELM)
    .otherwise(() => undefined)

  const { mutate: deployService } = useDeployService({ environmentId })

  const toasterCallback = () => {
    if (!service) {
      return
    }
    deployService({
      serviceId: applicationId,
      serviceType: service.serviceType,
    })
  }

  return (
    <div className="mt-2 bg-white rounded-sm flex flex-1">
      {scope && (
        <VariableList
          className="border-b border-b-neutral-200"
          scope={scope}
          serviceId={applicationId}
          organizationId={organizationId}
          projectId={projectId}
          environmentId={environmentId}
          onCreateVariable={() => {
            toast(
              'SUCCESS',
              'Creation success',
              'You need to redeploy your service for your changes to be applied.',
              toasterCallback,
              undefined,
              'Redeploy'
            )
          }}
          onEditVariable={() => {
            toast(
              'SUCCESS',
              'Edition success',
              'You need to redeploy your service for your changes to be applied.',
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
              `${name} has been deleted. You need to redeploy your service for your changes to be applied.`,
              toasterCallback,
              undefined,
              'Redeploy'
            )
          }}
        />
      )}
    </div>
  )
}

export default PageVariablesFeature
