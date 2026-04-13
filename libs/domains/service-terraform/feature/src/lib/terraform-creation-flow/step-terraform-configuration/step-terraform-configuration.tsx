import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { TerraformConfigurationSettings } from '@qovery/domains/service-settings/feature'
import { Button, FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useTerraformCreateContext } from '../../hooks/use-terraform-create-context/use-terraform-create-context'

export const StepTerraformConfiguration = () => {
  useDocumentTitle('General - Terraform configuration')
  const { generalForm, setCurrentStep } = useTerraformCreateContext()
  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = () => {
    navigate({ to: '../input-variables' })
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <TerraformConfigurationSettings methods={generalForm} />

      <div className="mt-10 flex justify-between">
        <Button type="button" size="lg" variant="plain" color="neutral" onClick={() => navigate({ to: '../general' })}>
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
