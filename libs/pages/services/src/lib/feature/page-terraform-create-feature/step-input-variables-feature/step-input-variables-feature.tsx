import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { TerraformVariablesSettings, useTerraformVariablesContext } from '@qovery/domains/service-terraform/feature'
import {
  SERVICES_TERRAFORM_CREATION_BASIC_CONFIG_URL,
  SERVICES_TERRAFORM_CREATION_SUMMARY_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useTerraformCreateContext } from '../page-terraform-create-feature'

export const StepInputVariablesFeature = () => {
  useDocumentTitle('General - Terraform configuration')

  const navigate = useNavigate()
  const { generalForm, setCurrentStep, creationFlowUrl } = useTerraformCreateContext()
  const { errors } = useTerraformVariablesContext()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onSubmit = generalForm.handleSubmit(() => {
    navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <FormProvider {...generalForm}>
        <Section>
          <form onSubmit={onSubmit} className="w-full">
            <TerraformVariablesSettings />

            <div className="mt-10 flex justify-between">
              <Button
                type="button"
                size="lg"
                variant="plain"
                color="neutral"
                onClick={() => navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_BASIC_CONFIG_URL)}
              >
                Back
              </Button>
              <div className="flex gap-3">
                <Button type="submit" size="lg" onClick={onSubmit} disabled={errors.size > 0}>
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}
