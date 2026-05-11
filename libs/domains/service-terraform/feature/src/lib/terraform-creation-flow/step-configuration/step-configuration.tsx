import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button, FunnelFlowBody } from '@qovery/shared/ui'
import { useTerraformCreateContext } from '../../hooks/use-terraform-create-context/use-terraform-create-context'
import { TerraformConfigurationSettings } from '../../terraform-configuration-settings/terraform-configuration-settings'

export const TerraformStepConfiguration = () => {
  const { generalForm, setCurrentStep } = useTerraformCreateContext()
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables',
      params: { organizationId, projectId, environmentId },
    })
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <TerraformConfigurationSettings methods={generalForm} />

      <div className="mt-10 flex justify-between">
        <Button
          type="button"
          size="lg"
          variant="plain"
          color="neutral"
          onClick={() =>
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/general',
              params: { organizationId, projectId, environmentId },
            })
          }
        >
          Back
        </Button>
        <div className="flex gap-3">
          <Button type="submit" size="lg" onClick={onSubmit} disabled={false}>
            Continue
          </Button>
        </div>
      </div>
    </FunnelFlowBody>
  )
}
