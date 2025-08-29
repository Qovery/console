import { useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { TERRAFORM_VERSIONS, TerraformConfigurationSettings } from '@qovery/domains/service-terraform/feature'
import {
  SERVICES_TERRAFORM_CREATION_GENERAL_URL,
  SERVICES_TERRAFORM_CREATION_INPUT_VARIABLES_URL,
} from '@qovery/shared/routes'
import {
  Button,
  Callout,
  FunnelFlowBody,
  Heading,
  Icon,
  InputSelect,
  InputText,
  RadioGroup,
  Section,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useTerraformCreateContext } from '../page-terraform-create-feature'

export function StepConfigurationFeature() {
  useDocumentTitle('General - Terraform configuration')

  const { generalForm, setCurrentStep, creationFlowUrl } = useTerraformCreateContext()

  const generalData = generalForm.getValues()

  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = () => {
    navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_INPUT_VARIABLES_URL)
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...generalForm}>
        <TerraformConfigurationSettings methods={generalForm} />

        <div className="mt-10 flex justify-between">
          <Button
            type="button"
            size="lg"
            variant="plain"
            color="neutral"
            onClick={() => navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_GENERAL_URL)}
          >
            Back
          </Button>
          <div className="flex gap-3">
            <Button type="submit" size="lg" onClick={onSubmit} disabled={false}>
              Continue
            </Button>
          </div>
        </div>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepConfigurationFeature
