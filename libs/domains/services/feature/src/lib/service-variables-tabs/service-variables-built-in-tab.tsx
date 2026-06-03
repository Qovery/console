import { useParams } from '@tanstack/react-router'
import { VariableList } from '@qovery/domains/variables/feature'
import { toast } from '@qovery/shared/ui'
import { useRedeployServiceAction } from '../hooks/use-redeploy-service-action/use-redeploy-service-action'
import { useService } from '../hooks/use-service/use-service'
import { getServiceVariableScope } from './service-variables-utils'

export function ServiceVariablesBuiltInTab() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const redeployServiceAction = useRedeployServiceAction(service?.serviceType)
  const scope = getServiceVariableScope(service?.serviceType)

  const onCreateVariableToast = () =>
    toast(
      'success',
      'Creation success',
      'You need to redeploy your service for your changes to be applied.',
      redeployServiceAction,
      'Redeploy'
    )

  if (!scope) {
    return null
  }

  return (
    <VariableList
      showOnly="built-in"
      hideSectionLabel
      headerActions={<div className="hidden" />}
      scope={scope}
      serviceId={serviceId}
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      onCreateVariable={onCreateVariableToast}
      onEditVariable={() => {
        toast(
          'success',
          'Edition success',
          'You need to redeploy your service for your changes to be applied.',
          redeployServiceAction,
          'Redeploy'
        )
      }}
    />
  )
}
