import { VariableList } from '@qovery/domains/variables/feature'
import { toast } from '@qovery/shared/ui'

interface BuiltInTabProps {
  scope: 'APPLICATION' | 'CONTAINER' | 'JOB' | 'HELM' | 'TERRAFORM'
  organizationId: string
  projectId: string
  environmentId: string
  serviceId: string
  toasterCallback: () => void
}

export function BuiltInTab({
  scope,
  organizationId,
  projectId,
  environmentId,
  serviceId,
  toasterCallback,
}: BuiltInTabProps) {
  const onCreateVariableToast = () =>
    toast(
      'success',
      'Creation success',
      'You need to redeploy your service for your changes to be applied.',
      toasterCallback,
      'Redeploy'
    )

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
          toasterCallback,
          'Redeploy'
        )
      }}
    />
  )
}
