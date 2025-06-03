import { useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  SERVICES_TERRAFORM_CREATION_GENERAL_URL,
  SERVICES_TERRAFORM_CREATION_VALUES_STEP_2_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, InputSelect, InputText } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { TERRAFORM_VERSIONS, useTerraformCreateContext } from '../page-terraform-create-feature'

export function StepConfigurationFeature() {
  useDocumentTitle('General - Terraform configuration')

  const { generalForm, setCurrentStep, creationFlowUrl } = useTerraformCreateContext()

  const generalData = generalForm.getValues()

  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = () => {
    navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_VALUES_STEP_2_URL)
  }

  return (
    <FunnelFlowBody>
      <FormProvider {...generalForm}>
        <Controller
          name="provider_version.explicit_version"
          control={generalForm.control}
          defaultValue={generalData.provider_version.explicit_version}
          rules={{ required: 'Terraform version is required' }}
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
            name="job_resources.storage_gib"
            control={generalForm.control}
            defaultValue={generalData.job_resources.storage_gib}
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

        {/* <hr className="my-4 border-t border-dashed border-neutral-250" />
        <div className="flex flex-col gap-5">
          <Controller
            name="terraform_variables_source.tf_var_file_paths"
            control={generalForm.control}
            defaultValue={generalData.terraform_variables_source.tf_var_file_paths}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value.join(',')}
                label="TF var file paths"
                error={error?.message}
                hint="TF variable file paths (separated by comma)"
              />
            )}
          />
          <Controller
            name="terraform_variables_source.tf_vars"
            control={generalForm.control}
            defaultValue={generalData.terraform_variables_source.tf_vars}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value.join(',')}
                label="TF vars"
                error={error?.message}
                hint="TF variables (separated by comma)"
              />
            )}
          />
        </div> */}

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
