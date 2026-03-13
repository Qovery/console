import { CloudProviderEnum, DatabaseModeEnum, type DatabaseTypeEnum } from 'qovery-typescript-axios'
import { type FormEventHandler, useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Heading, InputSelect, InputText, Section } from '@qovery/shared/ui'
import { type DatabaseCreateResourcesData, getDefaultManagedDatabaseInstanceType } from '../database-create-utils'
import { useDatabaseCreateContext } from '../database-creation-flow'

export interface DatabaseStepResourcesProps {
  onBack: () => void
  onSubmit: (data: DatabaseCreateResourcesData) => void
  cloudProvider?: CloudProviderEnum
  instanceTypeOptions?: Value[]
}

export function DatabaseStepResources({
  onBack,
  onSubmit,
  cloudProvider,
  instanceTypeOptions = [],
}: DatabaseStepResourcesProps) {
  const { generalForm, resourcesForm, setCurrentStep } = useDatabaseCreateContext()
  const generalData = generalForm.getValues()
  const methods = resourcesForm
  const isManaged = generalData.mode === DatabaseModeEnum.MANAGED
  const databaseType = generalData.type as DatabaseTypeEnum | undefined

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  useEffect(() => {
    if (isManaged && !methods.getValues('instance_type')) {
      const defaultInstanceType = getDefaultManagedDatabaseInstanceType(databaseType)
      if (defaultInstanceType) {
        methods.setValue('instance_type', defaultInstanceType, { shouldValidate: true })
      }
    }
  }, [databaseType, isManaged, methods])

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

              {!isManaged ? (
                <>
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
                </>
              ) : (
                <Controller
                  name="instance_type"
                  control={methods.control}
                  rules={{ required: 'Please select an instance type' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      isSearchable
                      onChange={field.onChange}
                      value={field.value}
                      label="Instance type"
                      error={error?.message}
                      options={instanceTypeOptions}
                      hint="The chosen instance type has a direct impact on your cloud provider cost."
                    />
                  )}
                />
              )}

              {!(isManaged && databaseType === 'REDIS') ? (
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
              ) : (
                <input type="hidden" {...methods.register('storage')} />
              )}
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
