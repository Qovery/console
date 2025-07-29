import { useEffect } from 'react'
import { type Control, Controller, FormProvider, type UseFieldArrayRemove, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useParseTerraformVariablesFromGitRepo } from '@qovery/domains/organizations/feature'
import { FieldVariableSuggestion } from '@qovery/domains/variables/feature'
import {
  SERVICES_TERRAFORM_CREATION_SUMMARY_URL,
  SERVICES_TERRAFORM_CREATION_VALUES_STEP_1_URL,
} from '@qovery/shared/routes'
import {
  Button,
  FunnelFlowBody,
  Heading,
  Icon,
  InputText,
  InputTextSmall,
  InputToggle,
  Section,
  Skeleton,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { type TerraformValuesArgumentsData, useTerraformCreateContext } from '../page-terraform-create-feature'

function VarRow({
  index,
  control,
  remove,
}: {
  index: number
  control: Control<TerraformValuesArgumentsData>
  remove: UseFieldArrayRemove
}) {
  const { environmentId = '' } = useParams()

  return (
    <li key={index} className="mb-3 last:mb-0">
      <div className="grid grid-cols-[6fr_6fr_32px_39px] items-center gap-x-3">
        <Controller
          name={`tf_vars.${index}.key`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall name={field.name} value={field.value} onChange={field.onChange} error={error?.message} />
          )}
        />

        <Controller
          name={`tf_vars.${index}.value`}
          control={control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <FieldVariableSuggestion
              value={field.value}
              environmentId={environmentId}
              onChange={field.onChange}
              inputProps={{
                className: 'w-full',
                name: field.name,
                onChange: field.onChange,
                value: field.value,
                error: error?.message,
              }}
            />
          )}
        />

        <Controller
          name={`tf_vars.${index}.secret`}
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-center">
              <InputToggle value={field.value} onChange={field.onChange} forceAlignTop small />
            </div>
          )}
        />

        <div>
          <Button size="md" className="h-[36px]" onClick={() => remove(index)} variant="plain">
            <Icon iconName="trash-can" iconStyle="regular" />
          </Button>
        </div>
      </div>
    </li>
  )
}

const TerraformVariables = () => {
  const { organizationId = '' } = useParams()
  const { generalForm, valuesOverrideArgumentsForm } = useTerraformCreateContext()

  const {
    fields: tfVars,
    append: tfVarsAppend,
    remove: tfVarsRemove,
  } = useFieldArray({
    control: valuesOverrideArgumentsForm.control,
    name: 'tf_vars',
  })

  const generalData = generalForm.getValues()

  const { data: variablesResponse, isLoading } = useParseTerraformVariablesFromGitRepo({
    organizationId,
    repository: {
      url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository),
      branch: generalData.branch,
      root_path: generalData.root_path,
      git_token_id: generalData.git_token_id,
    },
  })

  useEffect(() => {
    if (variablesResponse && !valuesOverrideArgumentsForm.formState.isDirty) {
      const payload =
        variablesResponse?.results?.map((variable) => ({
          key: variable.key,
          value: variable.default ?? '',
          secret: variable.sensitive,
        })) || []

      valuesOverrideArgumentsForm.setValue('tf_vars', payload)
    }
  }, [variablesResponse, valuesOverrideArgumentsForm])

  return isLoading ? (
    <TerraformVariablesSkeleton />
  ) : (
    <>
      {tfVars && tfVars.length > 0 && (
        <ul>
          <li className="mb-3 grid grid-cols-[6fr_6fr_83px] gap-x-3">
            <span className="text-sm font-medium text-neutral-350">Key</span>
            <span className="text-sm font-medium text-neutral-350">Value</span>
            <span className="text-sm font-medium text-neutral-350">Secret</span>
          </li>
          {tfVars.map((_, index) => (
            <VarRow key={index} index={index} control={valuesOverrideArgumentsForm.control} remove={tfVarsRemove} />
          ))}
        </ul>
      )}

      <Button
        className="gap-2 self-end"
        variant="surface"
        type="button"
        size="md"
        onClick={() =>
          tfVarsAppend({
            key: '',
            value: '',
            secret: false,
          })
        }
      >
        Add variable
        <Icon iconName="plus-circle" iconStyle="regular" />
      </Button>
    </>
  )
}

export function TerraformVariablesSkeleton() {
  return (
    <Section className="gap-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-x-3">
          <Skeleton className="h-[18px] w-full" />
          <Skeleton className="h-[18px] w-full" />
          <Skeleton className="h-[18px] w-full" />
        </div>
        <Skeleton className="h-[34px] w-full" />
        <Skeleton className="h-[34px] w-full" />
        <Skeleton className="h-[34px] w-full" />
      </div>
    </Section>
  )
}

export function StepVariablesFeature() {
  useDocumentTitle('General - Terraform configuration')

  const navigate = useNavigate()
  const { generalForm, setCurrentStep, valuesOverrideArgumentsForm, creationFlowUrl } = useTerraformCreateContext()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onSubmit = valuesOverrideArgumentsForm.handleSubmit(() => {
    navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...valuesOverrideArgumentsForm} {...generalForm}>
        <Section>
          <form onSubmit={onSubmit} className="w-full">
            <div className="space-y-10">
              <Section className="space-y-2">
                <Heading level={1}>Variables</Heading>
                <p className="text-sm text-neutral-350">Define variables that will be used by the Terraform service.</p>
              </Section>

              <Section className="gap-4">
                <div className="space-y-1">
                  <Heading level={2}>Manifest variables</Heading>
                  <p className="text-sm text-neutral-350">Auto-populate variables from existing .tfvar file(s).</p>
                </div>

                <Controller
                  name="tf_var_file_paths"
                  control={valuesOverrideArgumentsForm.control}
                  defaultValue={valuesOverrideArgumentsForm.getValues('tf_var_file_paths')}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      name={field.name}
                      type="text"
                      onChange={(e) => field.onChange(e.target.value.split(',').map((path) => path.trim()))}
                      value={field.value.join(',')}
                      label="Path to .tfvar file(s)"
                      error={error?.message}
                      hint="Comma separated file paths"
                    />
                  )}
                />
              </Section>

              <Section className="gap-4">
                <div className="space-y-1">
                  <Heading level={2}>Input variables</Heading>
                  <p className="text-sm text-neutral-350">
                    Fill any additional environment variables required to execute the Terraform commands.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <TerraformVariables />
                </div>
              </Section>
            </div>

            <div className="mt-10 flex justify-between">
              <Button
                type="button"
                size="lg"
                variant="plain"
                color="neutral"
                onClick={() => navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_VALUES_STEP_1_URL)}
              >
                Back
              </Button>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  size="lg"
                  onClick={onSubmit}
                  disabled={!valuesOverrideArgumentsForm.formState.isValid}
                >
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

export default StepVariablesFeature
