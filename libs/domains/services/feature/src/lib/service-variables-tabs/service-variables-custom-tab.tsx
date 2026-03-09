import { VariableList, VariablesActionToolbar } from '@qovery/domains/variables/feature'
import { toast } from '@qovery/shared/ui'

interface CustomTabProps {
  scope: 'APPLICATION' | 'CONTAINER' | 'JOB' | 'HELM' | 'TERRAFORM'
  organizationId: string
  projectId: string
  environmentId: string
  serviceId: string
  toasterCallback: () => void
}

export function CustomTab({ scope, organizationId, projectId, environmentId, serviceId, toasterCallback }: CustomTabProps) {
  const onCreateVariableToast = () =>
    toast(
      'SUCCESS',
      'Creation success',
      'You need to redeploy your service for your changes to be applied.',
      toasterCallback,
      undefined,
      'Redeploy'
    )

  return (
    <VariableList
      showOnly="custom"
      hideSectionLabel
      headerActions={
        <VariablesActionToolbar
          showDopplerButton
          scope={scope}
          projectId={projectId}
          environmentId={environmentId}
          serviceId={serviceId}
          onCreateVariable={onCreateVariableToast}
        />
      }
      scope={scope}
      serviceId={serviceId}
      organizationId={organizationId}
      projectId={projectId}
      environmentId={environmentId}
      onCreateVariable={onCreateVariableToast}
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
  )
}
