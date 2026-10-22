import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { Button, FunnelFlowBody, Heading, InputText, Section } from '@qovery/shared/ui'
import { type DatabaseCreateResourcesData } from '../database-create-utils/database-create-utils'
import { useDatabaseCreateContext } from '../database-creation-flow'

export interface DatabaseStepResourcesProps {
  onBack: () => void
  onSubmit: (data: DatabaseCreateResourcesData) => void
  cloudProvider?: CloudProviderEnum
}

export function DatabaseStepResources({ onBack, onSubmit, cloudProvider }: DatabaseStepResourcesProps) {
  const { resourcesForm, setCurrentStep } = useDatabaseCreateContext()
  const methods = resourcesForm

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const minVCpu = cloudProvider === CloudProviderEnum.GCP ? 250 : 10
  const minMemory = cloudProvider === CloudProviderEnum.GCP ? 512 : 1
  const minStorageValue = methods.formState.defaultValues?.storage !== 10 ? 20 : 10

  const handleSubmit: FormEventHandler<HTMLFormElement> = methods.handleSubmit((data) => {
    methods.reset(data)
    onSubmit(data)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Section className="space-y-10">
            <div className="flex flex-col gap-2">
              <Heading>Resources</Heading>
              <p className="text-sm text-neutral-subtle">Customize the resources assigned to the database.</p>
            </div>

            <Section className="gap-4">
              <Heading>Resources configuration</Heading>

              <Controller
                name="cpu"
                control={methods.control}
                rules={{
                  min: minVCpu,
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    type="number"
                    name={field.name}
                    label="vCPU (milli)"
                    value={field.value}
                    onChange={field.onChange}
                    hint={`Minimum value is ${minVCpu} milli vCPU.`}
                    error={
                      error?.type === 'min' ? `Minimum allowed ${field.name} is: ${minVCpu} milli vCPU.` : undefined
                    }
                  />
                )}
              />
              <Controller
                name="memory"
                control={methods.control}
                rules={{
                  required: 'Please enter a size.',
                  min: minMemory,
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Please enter a number.',
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    type="number"
                    name={field.name}
                    label="Memory (MiB)"
                    value={field.value}
                    onChange={field.onChange}
                    hint={`Minimum value is ${minMemory} MiB.`}
                    error={
                      error?.type === 'required'
                        ? 'Please enter a size.'
                        : error?.type === 'min'
                          ? `Minimum allowed ${field.name} is: ${minMemory} MiB.`
                          : error?.message
                    }
                  />
                )}
              />
              <Controller
                name="storage"
                control={methods.control}
                rules={{
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Please enter a number.',
                  },
                  min: {
                    value: minStorageValue,
                    message: `Storage must be at least ${minStorageValue} GiB.`,
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    type="number"
                    name={field.name}
                    label="Storage (GiB)"
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                  />
                )}
              />
            </Section>

            <div className="flex items-center justify-between">
              <Button onClick={onBack} type="button" size="lg" variant="plain">
                Back
              </Button>
              <Button type="submit" disabled={!methods.formState.isValid} size="lg">
                Continue
              </Button>
            </div>
          </Section>
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default DatabaseStepResources
