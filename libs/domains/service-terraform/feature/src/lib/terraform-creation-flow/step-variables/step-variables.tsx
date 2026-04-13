import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { TerraformVariablesSettings } from '@qovery/domains/service-settings/feature'
import { Button, FunnelFlowBody } from '@qovery/shared/ui'
import { useTerraformCreateContext } from '../../hooks/use-terraform-create-context/use-terraform-create-context'

export const StepVariables = () => {
  const navigate = useNavigate()
  const { setCurrentStep } = useTerraformCreateContext()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <div className="flex flex-col">
        <TerraformVariablesSettings />

        <div className="mt-10 flex justify-between">
          <Button
            type="button"
            size="lg"
            variant="plain"
            color="neutral"
            onClick={() => navigate({ to: '../terraform-configuration' })}
          >
            Back
          </Button>
          <div className="flex gap-3">
            <Button type="submit" size="lg" onClick={() => navigate({ to: '../summary' })} disabled={false}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </FunnelFlowBody>
  )
}
