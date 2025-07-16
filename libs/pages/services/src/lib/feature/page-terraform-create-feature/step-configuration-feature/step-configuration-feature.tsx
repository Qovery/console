import { useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  SERVICES_TERRAFORM_CREATION_GENERAL_URL,
  SERVICES_TERRAFORM_CREATION_VALUES_STEP_2_URL,
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
        <div className="space-y-10">
          <Section className="space-y-2">
            <Heading level={1}>Terraform configuration</Heading>
            <p className="text-sm text-neutral-350">Customize the resources assigned to the service.</p>
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Core configuration</Heading>
              <p className="text-sm text-neutral-350">Basic Terraform setup and state management settings.</p>
            </div>

            <Controller
              name="provider_version.explicit_version"
              control={generalForm.control}
              defaultValue={generalData.provider_version.explicit_version}
              render={({ field }) => (
                <InputSelect
                  label="State configuration"
                  value={field.value}
                  onChange={field.onChange}
                  options={TERRAFORM_VERSIONS.map((v) => ({ label: v, value: v }))}
                  hint="Select the Terraform version to use for the service"
                />
              )}
            />

            <Controller
              name="state"
              control={generalForm.control}
              defaultValue={generalData.state}
              render={({ field }) => (
                <InputSelect
                  label="State management"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    {
                      label: 'Kubernetes (default)',
                      value: 'kubernetes',
                    },
                  ]}
                  hint="Configure where the state should be located"
                  disabled={true}
                />
              )}
            />
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Execution settings</Heading>
              <p className="text-sm text-neutral-350">Configure how Terraform operations are executed.</p>
            </div>

            <Controller
              name="timeout_sec"
              control={generalForm.control}
              defaultValue={generalData.timeout_sec}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  type="number"
                  onChange={field.onChange}
                  value={field.value}
                  label="Execution timeout (in minutes)"
                  error={error?.message}
                  hint="Maximum duration for Terraform operations"
                />
              )}
            />
          </Section>

          <Section className="gap-4">
            <Heading level={2}>Execution credentials</Heading>

            <Callout.Root color="neutral" className="p-4">
              <Callout.Text>
                <Controller
                  name="use_cluster_credentials"
                  control={generalForm.control}
                  defaultValue={generalData.use_cluster_credentials}
                  render={({ field }) => (
                    <RadioGroup.Root
                      defaultValue={field.value ? 'true' : 'false'}
                      className="flex flex-col gap-5"
                      onValueChange={(value) => field.onChange(value === 'true')}
                    >
                      <label className="grid grid-cols-[16px_1fr] gap-3">
                        <RadioGroup.Item value="true" />
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">Cluster credentials</span>
                          <span className="text-sm text-neutral-350">
                            Use the cluster credentials to execute this Terraform manifest.
                          </span>
                        </div>
                      </label>
                      <label className="grid grid-cols-[16px_1fr] gap-3">
                        <RadioGroup.Item value="false" />
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">Environment variables</span>
                          <span className="text-sm text-neutral-350">
                            Use custom credentials injected as environment variables. To be used if cluster credential
                            permissions are not enough.
                          </span>
                        </div>
                      </label>
                    </RadioGroup.Root>
                  )}
                />

                {generalForm.watch('use_cluster_credentials') === false && (
                  <Callout.Root color="sky" className="mt-4">
                    <Callout.Icon>
                      <Icon iconName="info-circle" iconStyle="regular" />
                    </Callout.Icon>
                    <Callout.Text>You will be able to define the environment variables at the next step.</Callout.Text>
                  </Callout.Root>
                )}
              </Callout.Text>
            </Callout.Root>
          </Section>

          <Section className="gap-4">
            <Heading level={2}>Job resources</Heading>
            <Controller
              name="job_resources.cpu_milli"
              control={generalForm.control}
              defaultValue={generalData.job_resources.cpu_milli}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="vCPU (milli)"
                  error={error?.message}
                  disabled={true}
                />
              )}
            />
            <Controller
              name="job_resources.ram_mib"
              control={generalForm.control}
              defaultValue={generalData.job_resources.ram_mib}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Memory (mb)"
                  error={error?.message}
                  disabled={true}
                />
              )}
            />
            <Controller
              name="job_resources.storage_gib"
              control={generalForm.control}
              defaultValue={generalData.job_resources.storage_gib}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Storage (gb)"
                  error={error?.message}
                  disabled={true}
                />
              )}
            />
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="info-circle" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                Resources at job creation are set by default. If adjustments are needed, update them manually in the job
                settings after creation.
              </Callout.Text>
            </Callout.Root>
          </Section>
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
