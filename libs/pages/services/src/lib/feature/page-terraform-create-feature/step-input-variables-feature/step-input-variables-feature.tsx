import { type PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
import {
  type Control,
  Controller,
  FormProvider,
  type UseFieldArrayRemove,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useParseTerraformVariablesFromGitRepo } from '@qovery/domains/organizations/feature'
import { FieldVariableSuggestion } from '@qovery/domains/variables/feature'
import {
  SERVICES_TERRAFORM_CREATION_BASIC_CONFIG_URL,
  SERVICES_TERRAFORM_CREATION_SUMMARY_URL,
} from '@qovery/shared/routes'
import {
  Button,
  Checkbox,
  FunnelFlowBody,
  Heading,
  Icon,
  Indicator,
  InputTextSmall,
  InputToggle,
  Popover,
  Section,
  Skeleton,
  Tooltip,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl, twMerge } from '@qovery/shared/util-js'
import { type TerraformInputVariablesData, useTerraformCreateContext } from '../page-terraform-create-feature'

const VarRow = ({
  index,
  control,
  remove,
}: {
  index: number
  control: Control<TerraformInputVariablesData>
  remove: UseFieldArrayRemove
}) => {
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
  const { generalForm, inputVariablesForm } = useTerraformCreateContext()

  const {
    fields: tfVars,
    append: tfVarsAppend,
    remove: tfVarsRemove,
  } = useFieldArray({
    control: inputVariablesForm.control,
    name: 'tf_vars',
  })

  const generalData = generalForm.getValues()

  const { data: variablesResponse, isLoading } = useParseTerraformVariablesFromGitRepo({
    organizationId,
    repository: {
      provider: generalData.provider ?? 'GITHUB',
      url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository),
      branch: generalData.branch,
      root_path: generalData.root_path,
      git_token_id: generalData.git_token_id,
    },
  })

  useEffect(() => {
    if (variablesResponse && !inputVariablesForm.formState.isDirty) {
      const payload =
        variablesResponse?.results?.map((variable) => ({
          key: variable.key,
          value: variable.default ?? '',
          secret: variable.sensitive,
        })) || []

      inputVariablesForm.setValue('tf_vars', payload, { shouldDirty: false })
    }
  }, [variablesResponse, inputVariablesForm])

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
            <VarRow key={index} index={index} control={inputVariablesForm.control} remove={tfVarsRemove} />
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

const TerraformVariablesSkeleton = () => {
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

type TerraformVariablesContextType = {
  selectedRows: string[]
  onSelectRow: (key: string) => void
  isRowSelected: (key: string) => boolean
}

const TerraformVariablesContext = createContext<TerraformVariablesContextType | undefined>(undefined)

export const TerraformVariablesProvider = ({ children }: PropsWithChildren) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const onSelectRow = (key: string) => {
    if (isRowSelected(key)) {
      setSelectedRows(selectedRows.filter((row) => row !== key))
    } else {
      setSelectedRows([...selectedRows, key])
    }
  }
  const isRowSelected = (key: string) => {
    return selectedRows.includes(key)
  }

  const value = {
    selectedRows,
    onSelectRow,
    isRowSelected,
  }

  return <TerraformVariablesContext.Provider value={value}>{children}</TerraformVariablesContext.Provider>
}

export function useTerraformVariablesContext() {
  const context = useContext(TerraformVariablesContext)
  if (context === undefined) {
    throw new Error('useTerraformVariablesContext must be used within an TerraformVariablesContext')
  }
  return context
}

const TfvarItem = ({
  path,
  index,
  onIndexChange,
}: {
  path: string
  index: number
  onIndexChange: (path: string, index: number) => void
}) => {
  const { control, setValue } = useFormContext()
  const [currentIndex, setCurrentIndex] = useState<string | undefined>(index.toString())

  useEffect(() => {
    setCurrentIndex(index.toString())
  }, [index])

  return (
    <div className="grid grid-cols-[1fr_40px] items-center justify-between border-b border-neutral-200 px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-4">
        <Controller
          name="enabled_paths"
          control={control}
          render={({ field }) => (
            <Checkbox
              name={field.name}
              id={path}
              checked={field.value?.[path]}
              onCheckedChange={(checked: boolean) => setValue('enabled_paths', { ...field.value, [path]: checked })}
              className="ml-1"
            />
          )}
        />
        <label className="flex flex-col gap-0.5 text-sm" htmlFor={path}>
          <span className="text-neutral-400">{path}</span>
          <span className="text-xs text-neutral-350">5 variables</span>
        </label>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-md leading-3 text-neutral-350">#</span>
        <InputTextSmall
          name="order"
          value={currentIndex}
          onChange={(e) => {
            setCurrentIndex(e.target.value ?? '')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onIndexChange(path, Number(currentIndex ?? 0))
            }
          }}
          onBlur={() => {
            onIndexChange(path, Number(currentIndex ?? 0))
          }}
        />
      </div>
    </div>
  )
}

const TfvarsFilesPopover = () => {
  const [open, setOpen] = useState(false)
  const { control } = useFormContext()
  const [paths, setPaths] = useState(['variables.tfvars', 'main.tfvars', '*.auto.tfvars'])

  const onIndexChange = (path: string, newIndex: number) => {
    const currentIndex = paths.indexOf(path)
    const newPaths = [...paths]
    const element = newPaths[currentIndex]
    newPaths.splice(currentIndex, 1)
    newPaths.splice(newIndex, 0, element)
    setPaths(newPaths)
  }

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Indicator
          align="start"
          side="left"
          content={
            <span className="relative right-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-400 text-sm font-bold leading-[0] text-white">
              {paths.length ?? 0}
            </span>
          }
        >
          <Button size="md" color="brand" className="gap-1.5" onClick={() => setOpen(!open)} type="button">
            <Icon iconName="file-lines" iconStyle="regular" />
            .tfvars files
          </Button>
        </Indicator>
      </Popover.Trigger>
      <Popover.Content className="flex w-[340px] flex-col rounded-lg border border-neutral-200 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="px-1 py-1 text-sm font-medium text-neutral-400">Add and order .tfvars files</span>
          <Popover.Close>
            <button type="button" className="px-1 py-1">
              <Icon iconName="xmark" className="text-lg font-normal leading-4 text-neutral-350" />
            </button>
          </Popover.Close>
        </div>
        <div className="border-t border-neutral-200 px-4 py-3">
          <Controller
            name="path"
            control={control}
            render={({ field }) => (
              <InputTextSmall
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                placeholder="Path of .tfvar file"
              />
            )}
          />
        </div>
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-100 px-4 py-1">
          <span className="text-xs text-neutral-350">File order defines override priority.</span>
          <Tooltip
            classNameContent="max-w-[230px]"
            content="Files higher in the list override variables from lower ones. Manual values always take highest priority."
            side="left"
          >
            <span className="text-sm text-neutral-350">
              <Icon iconName="info-circle" iconStyle="regular" />
            </span>
          </Tooltip>
        </div>
        <div className="flex flex-col border-t border-neutral-200">
          {paths.map((path, index) => (
            <TfvarItem key={path} path={path} index={index} onIndexChange={onIndexChange} />
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

const TerraformVariablesEmptyState = () => {
  return (
    <div className="flex items-center justify-center border-t border-neutral-200 bg-neutral-100 p-4">
      <div className="flex flex-col items-center gap-2 py-4">
        <Icon iconName="key" iconStyle="regular" className="text-lg text-neutral-300" />
        <span className="text-center text-sm text-neutral-350">
          Load a .tfvars file or manually add variables
          <br />
          to configure your Terraform service.
        </span>
      </div>
    </div>
  )
}

const TerraformVariablesRows = () => {
  const { onSelectRow, isRowSelected } = useTerraformVariablesContext()

  const vars = [
    {
      key: 'key',
      value: 'value',
      source: 'source',
      secret: true,
    },
    {
      key: 'key2',
      value: 'value2',
      source: 'source2',
      secret: false,
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center border-t border-neutral-200">
      <div className="grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center border-b border-neutral-200 bg-neutral-100">
        <div className="flex h-full items-center justify-center border-r border-neutral-200">
          <Checkbox disabled />
        </div>
        <div className="flex h-full items-center border-r border-neutral-200">
          <span className="px-4 text-sm text-neutral-400">Variable</span>
        </div>
        <div className="flex h-full items-center border-r border-neutral-200">
          <span className="px-4 text-sm text-neutral-400">Value</span>
        </div>
        <div className="flex h-full items-center border-r border-neutral-200">
          <span className="px-4 text-sm text-neutral-400">Source</span>
        </div>
        <span className="text-center text-sm text-neutral-400">
          <Icon iconName="lock" iconStyle="regular" />
        </span>
      </div>

      {vars.map((row) => (
        <div
          key={row.key}
          className="grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center border-b border-neutral-200"
        >
          <div className="flex h-full items-center justify-center border-r border-neutral-200">
            <Checkbox checked={isRowSelected(row.key)} onCheckedChange={() => onSelectRow(row.key)} />
          </div>
          <div className="flex h-full items-center border-r border-neutral-200">
            <span className="px-4 text-sm text-neutral-400">{row.key}</span>
          </div>
          <div className="flex h-full items-center border-r border-neutral-200">
            <span className="px-4 text-sm text-neutral-400">{row.value}</span>
          </div>
          <div className="flex h-full items-center border-r border-neutral-200">
            <span className="px-4 text-sm text-neutral-400">{row.source}</span>
          </div>
          <span className="flex items-center justify-center text-center text-sm text-neutral-400">
            <InputToggle
              value={row.secret}
              onChange={(value) => {
                console.log(value)
              }}
              forceAlignTop
              small
            />
          </span>
        </div>
      ))}
    </div>
  )
}

const TerraformVariablesTable = () => {
  const { selectedRows } = useTerraformVariablesContext()

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-neutral-400">Variable configuration</span>
        <TfvarsFilesPopover />
      </div>

      {/* <TerraformVariablesEmptyState /> */}
      <TerraformVariablesRows />

      <div
        className={twMerge(
          'flex items-center border-t border-neutral-200 px-4 py-3',
          selectedRows.length > 0 ? 'justify-between' : 'justify-end'
        )}
      >
        {selectedRows.length > 0 && (
          <Button size="md" variant="solid" color="red" className="gap-1.5" type="button">
            <Icon iconName="trash-can" iconStyle="regular" />
            Delete selected
          </Button>
        )}
        <Button size="md" variant="surface" className="gap-1.5" type="button">
          Add variable
          <Icon iconName="plus" iconStyle="regular" />
        </Button>
      </div>
    </div>
  )
}

export const StepInputVariablesFeature = () => {
  useDocumentTitle('General - Terraform configuration')

  const navigate = useNavigate()
  const { generalForm, setCurrentStep, inputVariablesForm, creationFlowUrl } = useTerraformCreateContext()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onSubmit = inputVariablesForm.handleSubmit(() => {
    navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...inputVariablesForm} {...generalForm}>
        <TerraformVariablesProvider>
          <Section>
            <form onSubmit={onSubmit} className="w-full">
              <div className="space-y-10">
                <Section className="space-y-2">
                  <Heading level={1}>Configure Terrafrom Variables</Heading>
                  <p className="text-sm text-neutral-350">
                    Select .tfvars files and configure variable values for your Terraform deployment
                  </p>
                </Section>

                <TerraformVariablesTable />
              </div>

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
                  <Button type="submit" size="lg" onClick={onSubmit} disabled={!inputVariablesForm.formState.isValid}>
                    Continue
                  </Button>
                </div>
              </div>
            </form>
          </Section>
        </TerraformVariablesProvider>
      </FormProvider>
    </FunnelFlowBody>
  )
}
