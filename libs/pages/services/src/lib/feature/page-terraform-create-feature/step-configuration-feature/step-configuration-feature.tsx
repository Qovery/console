import { useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { SERVICES_TERRAFORM_CREATION_GENERAL_URL, SERVICES_TERRAFORM_CREATION_SUMMARY_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, InputSelect, InputText } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useTerraformCreateContext } from '../page-terraform-create-feature'

const TERRAFORM_VERSIONS = [
  '1.12.1',
  '1.11.4',
  '1.10.5',
  '1.9.8',
  '1.8.5',
  '1.7.5',
  '1.6.6',
  '1.5.7',
  '1.4.7',
  '1.3.10',
  '1.2.9',
  '1.1.9',
  '1.0.11',
  '0.15.5',
  '0.14.11',
  '0.13.7',
  '0.12.31',
  '0.11.15',
  '0.10.8',
  '0.9.11',
  '0.8.8',
  '0.7.13',
  '0.6.16',
  '0.5.3',
  '0.4.2',
  '0.3.7',
  '0.2.2',
  '0.1.1',
]

export function StepConfigurationFeature() {
  useDocumentTitle('General - Terraform configuration')

  const { generalForm, valuesOverrideFileForm, setCurrentStep, creationFlowUrl } = useTerraformCreateContext()

  const generalData = generalForm.getValues()

  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = valuesOverrideFileForm.handleSubmit(() => {
    navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...generalForm}>
        <Controller
          name="provider_version.explicit_version"
          control={generalForm.control}
          defaultValue={generalData.provider_version.explicit_version}
          render={({ field }) => (
            <InputSelect
              label="Terraform version"
              value={field.value}
              onChange={field.onChange}
              options={TERRAFORM_VERSIONS.map((v) => ({ label: v, value: v }))}
            />
          )}
        />
        <hr className="my-4 border-t border-dashed border-neutral-250" />

        <div className="flex flex-col gap-5">
          <Controller
            name="job_resources.cpu_milli"
            control={generalForm.control}
            defaultValue={generalData.job_resources.cpu_milli}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-name"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="CPU (m)"
                error={error?.message}
                hint="Amount of CPU allocated to the job resources"
              />
            )}
          />
          <Controller
            name="job_resources.ram_mib"
            control={generalForm.control}
            defaultValue={generalData.job_resources.ram_mib}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-name"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="RAM (MiB)"
                error={error?.message}
                hint="Amount of RAM allocated to the job resources"
              />
            )}
          />
          <Controller
            name="job_resources.storage_gb"
            control={generalForm.control}
            defaultValue={generalData.job_resources.storage_gb}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-name"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Storage (GB)"
                error={error?.message}
                hint="Amount of storage allocated to the job resources"
              />
            )}
          />
        </div>
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
