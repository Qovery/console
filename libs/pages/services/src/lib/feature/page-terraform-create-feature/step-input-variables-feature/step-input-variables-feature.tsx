import { type CheckedState } from '@radix-ui/react-checkbox'
import { GitProviderEnum, type TfVarsFileResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useListTfVarsFilesFromGitRepo } from '@qovery/domains/organizations/feature'
import {
  SERVICES_TERRAFORM_CREATION_BASIC_CONFIG_URL,
  SERVICES_TERRAFORM_CREATION_SUMMARY_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  Checkbox,
  FunnelFlowBody,
  Heading,
  Icon,
  Indicator,
  InputTextSmall,
  InputToggle,
  LoaderSpinner,
  Popover,
  Section,
  Tooltip,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { useTerraformCreateContext } from '../page-terraform-create-feature'

type TerraformVariablesContextType = {
  selectedRows: string[]
  onSelectRow: (key: string) => void
  isRowSelected: (key: string) => boolean
  areTfVarsFilesLoading: boolean
  tfVarFiles: TfVarsFile[]
  setTfVarFiles: (tfVarFiles: TfVarsFile[]) => void
  variableRows: VariableRowItem[]
  hoveredRow: string | undefined
  setHoveredRow: (hoveredRow: string | undefined) => void
  customVariables: VariableRowItem[]
  setCustomVariable: (variable: VariableRowItem) => void
  resetCustomVariable: (key: string) => void
}

type VariableRowItem = {
  key: string
  value: string
  source?: string
  secret?: boolean
}

type TfVarsFile = TfVarsFileResponse & {
  enabled: boolean
}

const TerraformVariablesContext = createContext<TerraformVariablesContextType | undefined>(undefined)

const transformTfVarsFile = (tfVarFile: TfVarsFileResponse): TfVarsFile => {
  return {
    ...tfVarFile,
    enabled: true,
  }
}

export const TerraformVariablesProvider = ({ children }: PropsWithChildren) => {
  const { generalForm } = useTerraformCreateContext()
  const { organizationId = '' } = useParams()
  const { data: tfVarFilesResponse = [], isLoading: areTfVarsFilesLoading } = useListTfVarsFilesFromGitRepo({
    organizationId,
    repository: {
      url: generalForm.getValues().git_repository?.url ?? '',
      branch: generalForm.getValues().branch ?? '',
      root_path: generalForm.getValues().root_path ?? '',
      git_token_id: generalForm.getValues().git_repository?.git_token_id ?? '',
      provider: generalForm.getValues().provider ?? GitProviderEnum.GITHUB,
    },
    mode: {
      type: 'AutoDiscover',
    },
    enabled: true,
  })
  const [customVariables, setCustomVariables] = useState<TerraformVariablesContextType['customVariables']>([])
  const [tfVarFiles, setTfVarFiles] = useState<TfVarsFile[]>(tfVarFilesResponse.map(transformTfVarsFile))
  const variableRows: TerraformVariablesContextType['variableRows'] = useMemo(() => {
    const vars = new Map<string, VariableRowItem>()
    const files = [...tfVarFiles.filter((file) => file.enabled)].reverse()
    files.forEach((file) => {
      Object.entries(file.variables).forEach(([fileKey, fileValue]) => {
        const customVariable = customVariables.find((customVariable) => customVariable.key === fileKey)
        const value = customVariable?.value ?? fileValue
        vars.set(fileKey, { key: fileKey, value, source: file.source, secret: false }) // TODO [QOV-1266] Are we keeping 'secret' here?
      })
    })
    return [...vars.values()]
  }, [tfVarFiles, customVariables])

  const [selectedRows, setSelectedRows] = useState<TerraformVariablesContextType['selectedRows']>([])
  const [hoveredRow, setHoveredRow] = useState<TerraformVariablesContextType['hoveredRow']>(undefined)
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
  const setCustomVariable = (variable: VariableRowItem) => {
    setCustomVariables([...customVariables.filter((customVariable) => customVariable.key !== variable.key), variable])
  }
  const resetCustomVariable = (key: string) => {
    setCustomVariables(customVariables.filter((customVariable) => customVariable.key !== key))
  }

  const value: TerraformVariablesContextType = {
    selectedRows,
    onSelectRow,
    isRowSelected,
    areTfVarsFilesLoading,
    tfVarFiles,
    variableRows,
    hoveredRow,
    setHoveredRow,
    customVariables,
    setCustomVariable,
    resetCustomVariable,
    setTfVarFiles,
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
  file,
  index,
  onIndexChange,
}: {
  file: TfVarsFile
  index: number
  onIndexChange: (file: TfVarsFile, index: number) => void
}) => {
  const { setHoveredRow, tfVarFiles, setTfVarFiles } = useTerraformVariablesContext()
  const [currentIndex, setCurrentIndex] = useState<string | undefined>(index.toString())

  const onCheckedChange = useCallback(
    (checked: CheckedState) => {
      const newFiles = [...tfVarFiles]
      const fileIndex = newFiles.findIndex((tfVarFile) => tfVarFile.source === file.source)
      if (fileIndex !== -1) {
        newFiles[fileIndex] = { ...newFiles[fileIndex], enabled: checked ? true : false }
      }

      setTfVarFiles(newFiles)
    },
    [tfVarFiles, file.source, setTfVarFiles]
  )

  useEffect(() => {
    setCurrentIndex(index.toString())
  }, [index])

  return (
    <div
      className="grid grid-cols-[1fr_40px] items-center justify-between border-b border-neutral-200 px-4 py-3 last:border-b-0"
      onMouseEnter={() => setHoveredRow(file.source)}
      onMouseLeave={() => setHoveredRow(undefined)}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          name={file.source}
          id={file.source}
          checked={file.enabled}
          onCheckedChange={onCheckedChange}
          className="ml-1"
        />
        <label className="flex flex-col gap-0.5 text-sm" htmlFor={file.source}>
          <span className="text-neutral-400">{file.source}</span>
          <span className="text-xs text-neutral-350">{Object.keys(file.variables).length} variables</span>
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
              onIndexChange(file, Number(currentIndex ?? 0))
            }
          }}
          onBlur={() => {
            onIndexChange(file, Number(currentIndex ?? 0))
          }}
        />
      </div>
    </div>
  )
}

const TfvarsFilesPopover = () => {
  const { control } = useFormContext()
  const { tfVarFiles, setTfVarFiles } = useTerraformVariablesContext()

  const onIndexChange = (file: TfVarsFile, newIndex: number) => {
    const currentIndex = tfVarFiles.indexOf(file)
    const newFiles = [...tfVarFiles]
    const element = newFiles[currentIndex]
    newFiles.splice(currentIndex, 1)
    newFiles.splice(newIndex, 0, element)
    setTfVarFiles(newFiles)
  }

  return (
    <Popover.Root>
      <Popover.Trigger>
        <div>
          {tfVarFiles.filter((file) => file.enabled).length > 0 ? (
            <Indicator
              align="start"
              side="left"
              content={
                <span className="relative right-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-400 text-sm font-bold leading-[0] text-white">
                  {tfVarFiles.filter((file) => file.enabled).length ?? 0}
                </span>
              }
            >
              <Button size="md" variant="outline" className="gap-1.5" type="button">
                <Icon iconName="file-lines" iconStyle="regular" />
                .tfvars files
              </Button>
            </Indicator>
          ) : (
            <Button size="md" variant="solid" className="gap-1.5" type="button">
              <Icon iconName="file-lines" iconStyle="regular" />
              .tfvars files
            </Button>
          )}
        </div>
      </Popover.Trigger>
      <Popover.Content side="right" className="flex w-[340px] flex-col rounded-lg border border-neutral-200 p-0">
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
          {tfVarFiles.map((file, index) => (
            <TfvarItem key={file.source} file={file} index={index} onIndexChange={onIndexChange} />
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

const TerraformVariablesEmptyState = () => {
  return (
    <div className="flex items-center justify-center border-b border-t border-neutral-200 bg-neutral-100 p-4">
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

const getSourceBadgeColor = (row: VariableRowItem, customVariable: VariableRowItem | undefined) => {
  if (customVariable) {
    return 'yellow'
  }
  // TODO [QOV-1266] Manage colors for most common sources
  return 'sky'
}

const VariableRow = ({ row }: { row: VariableRowItem }) => {
  const { onSelectRow, isRowSelected, hoveredRow, customVariables, setCustomVariable, resetCustomVariable } =
    useTerraformVariablesContext()

  const customVariable = customVariables.find((customVariable) => customVariable.key === row.key)

  return (
    <div
      className={twMerge(
        'grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center border-b border-neutral-200',
        hoveredRow === row.source && 'bg-neutral-100'
      )}
    >
      <div className="flex h-full items-center justify-center border-r border-neutral-200">
        <Checkbox checked={isRowSelected(row.key)} onCheckedChange={() => onSelectRow(row.key)} />
      </div>
      <div className="flex h-full items-center border-r border-neutral-200">
        <span className="px-4 text-sm text-neutral-400">{row.key}</span>
      </div>
      <div className="flex h-full cursor-text items-center border-r border-neutral-200 hover:bg-neutral-100">
        <input
          name="value"
          value={row.value}
          onChange={(e) => {
            setCustomVariable({ ...row, value: e.target.value })
          }}
          className="h-full w-full bg-transparent px-4 text-sm"
        />
        {customVariable && (
          <Button
            size="md"
            variant="plain"
            color="neutral"
            type="button"
            onClick={() => resetCustomVariable(customVariable.key)}
          >
            <Icon iconName="rotate-left" iconStyle="regular" />
          </Button>
        )}
      </div>
      <div className="flex h-full items-center border-r border-neutral-200 px-4">
        <Badge variant="surface" color={getSourceBadgeColor(row, customVariable)} className="text-sm">
          {customVariable ? 'Override from file' : ''}
          {row.source}
        </Badge>
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
  )
}

const TerraformVariablesRows = () => {
  const { variableRows } = useTerraformVariablesContext()

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

      {variableRows.map((row) => (
        <VariableRow key={row.key} row={row} />
      ))}
    </div>
  )
}

const TerraformVariablesLoadingState = () => {
  return (
    <div className="flex items-center justify-center border-b border-t border-neutral-200 bg-neutral-100 p-4">
      <div className="flex flex-col items-center gap-4 py-4">
        <LoaderSpinner classWidth="w-6" theme="light" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-center text-sm font-medium text-neutral-350">Fetching .tfvars files...</span>
          <span className="text-center text-sm text-neutral-350">Pulling your Terraform variable definitions.</span>
        </div>
      </div>
    </div>
  )
}

const TerraformVariablesTable = () => {
  const { selectedRows, areTfVarsFilesLoading } = useTerraformVariablesContext()

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-neutral-400">Variable configuration</span>
        <TfvarsFilesPopover />
      </div>

      {/* <TerraformVariablesEmptyState /> */}
      {areTfVarsFilesLoading ? <TerraformVariablesLoadingState /> : <TerraformVariablesRows />}

      <div
        className={twMerge('flex items-center px-4 py-3', selectedRows.length > 0 ? 'justify-between' : 'justify-end')}
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
    <FunnelFlowBody customContentWidth="max-w-[794px]">
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
