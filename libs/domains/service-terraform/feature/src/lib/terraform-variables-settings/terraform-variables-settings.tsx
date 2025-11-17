import { type CheckedState } from '@radix-ui/react-checkbox'
import { type AxiosError } from 'axios'
import { GitProviderEnum, type TfVarsFileResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  useListTfVarsFilesFromGitRepo,
  useParseTerraformVariablesFromGitRepo,
} from '@qovery/domains/organizations/feature'
import { useService } from '@qovery/domains/services/feature'
import { DropdownVariable } from '@qovery/domains/variables/feature'
import {
  Badge,
  Button,
  Checkbox,
  Heading,
  Icon,
  Indicator,
  InputTextSmall,
  LoaderSpinner,
  PasswordShowHide,
  Popover,
  Section,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type TerraformGeneralData } from '../terraform-configuration-settings/terraform-configuration-settings'

const CUSTOM_SOURCE = 'Custom'

type TerraformVariablesContextType = {
  selectedRows: string[]
  setSelectedRows: (selectedRows: string[]) => void
  selectRow: (key: string) => void
  isRowSelected: (key: string) => boolean
  areTfVarsFilesLoading: boolean
  tfVarFiles: TfVarsFile[]
  tfVarFilePaths: string[]
  setTfVarFiles: (tfVarFiles: TfVarsFile[]) => void
  variableRows: VariableRowItem[]
  hoveredRow: string | undefined
  setHoveredRow: (hoveredRow: string | undefined) => void
  overrideValue: (key: string, value: string) => void
  resetOverride: (key: string) => void
  addCustomVariable: () => void
  deleteSelectedRows: () => void
  setFileListOrder: (fileListOrder: string[]) => void
  focusedCell: string | undefined
  setFocusedCell: (focusedCell: string | undefined) => void
  fetchTfVarsFiles: () => void
  newPath: string
  setNewPath: (newPath: string) => void
  submitNewPath: () => void
  newPathErrorMessage: string | undefined
  setNewPathErrorMessage: (newPathErrorMessage: string | undefined) => void
  hoveredCell: string | undefined
  setHoveredCell: (hoveredCell: string | undefined) => void
  isVariableOverride: (key: string) => boolean
  getVariableValue: (key: string) => string
  getVariableSource: (key: string) => string
  isCustomVariable: (key: string) => boolean
  toggleSecret: (key: string, value: boolean) => void
  overrides: OverrittenVariable[]
  overrideKey: (key: string, newKey: string) => void
}

type VariableRowItem = {
  key: string
  values: { value: string; source: string }[]
  secret: boolean
}
type OverrittenVariable = {
  key: string
  value: string
  secret: boolean
  source: string
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
  const { getValues } = useFormContext<TerraformGeneralData>()
  const { organizationId = '', applicationId = '' } = useParams()
  const { data: serviceResponse } = useService({ serviceId: applicationId })
  const service = match(serviceResponse)
    .with({ serviceType: 'TERRAFORM' }, (s) => s)
    .otherwise(() => null)

  // Memoize the repository config to prevent unnecessary re-renders and refetches.
  // If we're in the context of the settings page, we use the service data to get the repository config.
  // Otherwise, we use the form values of the service creation flow.
  const formValues = getValues()
  const repositoryConfig = useMemo(() => {
    return {
      url:
        service?.terraform_files_source?.git?.git_repository?.url ??
        formValues.git_repository?.url ??
        formValues.repository ??
        '',
      branch: service?.terraform_files_source?.git?.git_repository?.branch ?? formValues.branch ?? '',
      root_path: service?.terraform_files_source?.git?.git_repository?.root_path ?? formValues.root_path ?? '',
      git_token_id: service?.terraform_files_source?.git?.git_repository?.git_token_id ?? formValues.git_token_id ?? '',
      provider:
        service?.terraform_files_source?.git?.git_repository?.provider ?? formValues.provider ?? GitProviderEnum.GITHUB,
    }
  }, [formValues, service])

  const { data: variablesResponse } = useParseTerraformVariablesFromGitRepo({
    organizationId,
    repository: repositoryConfig,
    enabled: Boolean(repositoryConfig.branch),
  })

  const [tfVarFilesResponse, setTfVarFilesResponse] = useState<TfVarsFileResponse[]>([])
  const [newPath, setNewPath] = useState<TerraformVariablesContextType['newPath']>('')
  const [newPathErrorMessage, setNewPathErrorMessage] = useState<string | undefined>(undefined)

  const { mutateAsync: fetchTfVars, status: tfVarsFilesStatus } = useListTfVarsFilesFromGitRepo()

  const fetchTfVarsFiles = useCallback(async () => {
    try {
      setNewPathErrorMessage(undefined)
      await fetchTfVars(
        {
          organizationId,
          repository: repositoryConfig,
          mode: {
            type: 'AutoDiscover',
          },
        },
        {
          onSuccess: (data) => {
            if (data && newPath.length === 0) {
              // Should follow the order of the service's tf_var_file_paths
              const servicePaths = [...(service?.terraform_variables_source.tf_var_file_paths ?? [])].reverse()
              data.sort((a, b) => {
                const aIndex = servicePaths.indexOf(a.source) ?? 0
                const bIndex = servicePaths.indexOf(b.source) ?? 0
                return aIndex - bIndex
              })
              setTfVarFilesResponse(data)
            }
          },
        }
      )
    } catch (error) {
      console.error(error)
    }
  }, [fetchTfVars, organizationId, repositoryConfig, newPath, service?.terraform_variables_source.tf_var_file_paths])

  const areTfVarsFilesLoading = useMemo(() => tfVarsFilesStatus === 'loading', [tfVarsFilesStatus])
  const serviceVars = useMemo(() => service?.terraform_variables_source.tf_vars ?? [], [service])
  const parsedVars = useMemo(() => variablesResponse ?? [], [variablesResponse])

  // Save list order
  const [fileListOrder, setFileListOrder] = useState<string[]>([])

  // Transform the response data and memoize based on content, not reference
  const tfVarFilesFromResponse = useMemo(() => tfVarFilesResponse.map(transformTfVarsFile), [tfVarFilesResponse])

  // Allow manual override of file enabled state
  const [fileEnabledOverrides, setFileEnabledOverrides] = useState<Record<string, boolean>>({})

  const tfVarFiles: TfVarsFile[] = useMemo(() => {
    return tfVarFilesFromResponse
      .sort((a, b) => fileListOrder.indexOf(a.source) - fileListOrder.indexOf(b.source))
      .map((file) => ({
        ...file,
        enabled: fileEnabledOverrides[file.source] ?? file.enabled,
      }))
  }, [tfVarFilesFromResponse, fileEnabledOverrides, fileListOrder])

  const filteredTfVarFiles = [...tfVarFiles.filter((file) => file.enabled)].reverse()
  const filesVars = useMemo(
    () => [
      ...new Map(
        filteredTfVarFiles.flatMap((file) =>
          Object.entries(file.variables).map(([key, value]) => [
            key,
            { key, value, source: file.source, secret: false },
          ])
        )
      ).values(),
    ],
    [filteredTfVarFiles]
  )

  const [overrides, setOverrides] = useState<OverrittenVariable[]>(
    serviceVars.map((variable) => ({
      key: variable.key ?? '',
      value: variable.value ?? '',
      secret: variable.secret ?? false,
      source: CUSTOM_SOURCE,
    }))
  )

  const allVariables = useMemo(() => [...parsedVars, ...filesVars, ...overrides], [parsedVars, filesVars, overrides])
  const keys = useMemo(() => allVariables.map((variable) => variable.key ?? ''), [allVariables])

  // Combine variables coming from the parsed variables (from the git repo), files vars (tfvars files) and overrides (manual overrides or custom variables)
  const combinedVariables: Map<string, VariableRowItem> = useMemo(() => {
    return new Map(
      keys.map((key) => {
        // Find all associated variables for a given key
        const variables = allVariables.filter((variable) => variable.key === key)
        const values: VariableRowItem['values'] = variables
          .map((variable) => {
            const value =
              'default' in variable ? variable.default ?? '' : 'value' in variable ? variable.value ?? '' : ''

            // Source: if the current variable has a source, use it, otherwise set to custom
            const source = 'source' in variable ? variable.source : CUSTOM_SOURCE

            return {
              value,
              source,
            }
          })
          .filter((value) => value !== undefined)
        const secret = variables.some((variable) => {
          return 'sensitive' in variable ? variable.sensitive : 'secret' in variable ? variable.secret : false
        })

        return [
          key,
          {
            key,
            values,
            secret,
          },
        ]
      })
    )
  }, [allVariables, keys])

  const setTfVarFiles = useCallback((newFiles: TfVarsFile[]) => {
    const overrides: Record<string, boolean> = {}
    newFiles.forEach((file) => {
      overrides[file.source] = file.enabled
    })
    setFileEnabledOverrides(overrides)
  }, [])

  const variableRows: TerraformVariablesContextType['variableRows'] = useMemo(() => {
    return Array.from(combinedVariables.values())
  }, [combinedVariables])

  const [selectedRows, setSelectedRows] = useState<TerraformVariablesContextType['selectedRows']>([])
  const [hoveredRow, setHoveredRow] = useState<TerraformVariablesContextType['hoveredRow']>(undefined)
  const [focusedCell, setFocusedCell] = useState<TerraformVariablesContextType['focusedCell']>(undefined)
  const [hoveredCell, setHoveredCell] = useState<TerraformVariablesContextType['hoveredCell']>(undefined)

  const tfVarFilePaths: TerraformVariablesContextType['tfVarFilePaths'] = useMemo(() => {
    return tfVarFiles.filter((tfVarFile) => tfVarFile.enabled).map((tfVarFile) => tfVarFile.source ?? '')
  }, [tfVarFiles])

  const isRowSelected = useCallback(
    (key: string) => {
      return selectedRows.includes(key)
    },
    [selectedRows]
  )

  const selectRow = useCallback((key: string) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(key)) {
        return prevSelectedRows.filter((row) => row !== key)
      } else {
        return [...prevSelectedRows, key]
      }
    })
  }, [])

  const getLastVariableItem = useCallback(
    (
      key: string
    ):
      | {
          value: string
          source: string
        }
      | undefined => {
      const variable = variableRows.find((variableRow) => variableRow.key === key)
      return variable?.values?.[variable?.values.length - 1] ?? undefined
    },
    [variableRows]
  )

  const getVariableValue = useCallback(
    (key: string): string => {
      const variable = getLastVariableItem(key)
      // Get the last value for the variable
      return variable?.value ?? ''
    },
    [getLastVariableItem]
  )

  const getVariableSource = useCallback(
    (key: string): string => {
      const currentVar = getLastVariableItem(key)
      const currentSource = currentVar?.source

      if (currentSource === CUSTOM_SOURCE && currentVar) {
        const allVars = variableRows.find((variableRow) => variableRow.key === key)
        const previousVarSource = allVars?.values[allVars?.values.indexOf(currentVar) - 1]?.source

        if (previousVarSource) {
          return `Override from ${previousVarSource}`
        }

        return currentSource
      }

      return currentVar?.source ?? ''
    },
    [variableRows, getLastVariableItem]
  )

  const isVariableOverride = useCallback(
    (key: string): boolean => {
      return getVariableSource(key).startsWith('Override from') ? true : false
    },
    [getVariableSource]
  )

  const overrideValue = useCallback(
    (key: string, value: string) => {
      const variable = overrides.find((customVariable) => customVariable.key === key)

      if (variable) {
        setOverrides((prevCustomVariables) =>
          prevCustomVariables.map((customVariable) =>
            customVariable.key === key ? { ...customVariable, value } : customVariable
          )
        )
      } else {
        setOverrides((prevCustomVariables) => [
          ...prevCustomVariables,
          {
            key,
            value,
            secret: false,
            source: CUSTOM_SOURCE,
          },
        ])
      }
    },
    [overrides]
  )

  const overrideKey = useCallback((key: string, newKey: string) => {
    setOverrides((prevOverrides) => {
      const hasOverride = prevOverrides.find((override) => override.key === key)
      if (hasOverride) {
        return prevOverrides.map((o) => (o.key === key ? { ...o, key: newKey } : o))
      } else {
        return [...prevOverrides, { key: newKey, value: '', secret: false, source: CUSTOM_SOURCE }]
      }
    })
  }, [])

  const toggleSecret = useCallback(
    (key: string, isSecret: boolean) => {
      const currentOverride = overrides.find((o) => o.key === key)
      const currentValue = getVariableValue(key)
      const currentSource = getVariableSource(key)

      if (currentOverride) {
        // If the variable is a secret or a custom variable, update the secret state
        if (isSecret || currentSource === CUSTOM_SOURCE) {
          setOverrides((prevOverrides) => prevOverrides.map((o) => (o.key === key ? { ...o, secret: isSecret } : o)))
        } else {
          // Otherwise, remove the existing override
          setOverrides((prevOverrides) => prevOverrides.filter((o) => o.key !== key))
        }
      } else {
        // If the variable is not an override, add a new override
        setOverrides((prevOverrides) => [
          ...prevOverrides,
          { key, value: currentValue, secret: isSecret, source: CUSTOM_SOURCE },
        ])
      }
    },
    [overrides, getVariableValue, getVariableSource]
  )

  // Reset the override for a specific key by removing the override from the overrides array
  const resetOverride = useCallback((key: string) => {
    setOverrides((prevOverrides) => prevOverrides.filter((o) => o.key !== key))
  }, [])

  // Add a new custom variable to the overrides array
  const addCustomVariable = useCallback(() => {
    setOverrides((prevOverrides) => {
      const currentCount = prevOverrides.length
      let newKey = 'custom_' + (currentCount + 1)
      const doesExist = (key: string) => prevOverrides.find((o) => o.key === key)
      while (doesExist(newKey)) {
        newKey = 'custom_' + (Number(newKey.split('_')[1]) + 1)
      }

      return [
        ...prevOverrides,
        {
          key: newKey,
          value: '',
          secret: false,
          source: 'Custom',
        },
      ]
    })
  }, [])

  // Delete the selected rows from the overrides array and clear the selected rows
  const deleteSelectedRows = useCallback(() => {
    setOverrides((prevOverrides) => prevOverrides.filter((o) => !selectedRows.includes(o.key)))
    setSelectedRows([])
  }, [selectedRows, setOverrides, setSelectedRows])

  const submitNewPath = useCallback(async () => {
    try {
      await fetchTfVars(
        {
          organizationId,
          repository: repositoryConfig,
          mode: {
            type: 'SpecificPaths',
            paths: [newPath],
          },
        },
        {
          onSuccess: (data) => {
            if (data) {
              setTfVarFilesResponse((prevTfVarFilesResponse) => [...prevTfVarFilesResponse, ...data])
              setNewPath('')
              setNewPathErrorMessage(undefined)
            }
          },
          onError: (error) => {
            setNewPathErrorMessage((error as AxiosError).message)
          },
        }
      )
    } catch (error) {
      console.error(error)
    }
  }, [fetchTfVars, organizationId, repositoryConfig, newPath])

  // Check if the variable is a custom variable by checking if the override exists and the source is CUSTOM_SOURCE
  const isCustomVariable = useCallback(
    (key: string): boolean => {
      const override = overrides.find((o) => o.key === key)
      const source = getVariableSource(key)
      return !!override && source === CUSTOM_SOURCE
    },
    [overrides, getVariableSource]
  )

  const value: TerraformVariablesContextType = useMemo(
    () => ({
      selectedRows,
      setSelectedRows,
      selectRow,
      isRowSelected,
      areTfVarsFilesLoading,
      tfVarFiles,
      tfVarFilePaths,
      variableRows,
      hoveredRow,
      setHoveredRow,
      setTfVarFiles,
      deleteSelectedRows,
      setFileListOrder,
      focusedCell,
      setFocusedCell,
      fetchTfVarsFiles,
      newPath,
      setNewPath,
      submitNewPath,
      newPathErrorMessage,
      setNewPathErrorMessage,
      hoveredCell,
      setHoveredCell,
      getVariableValue,
      getVariableSource,
      addCustomVariable,
      isCustomVariable,
      toggleSecret,
      overrides,
      overrideKey,
      overrideValue,
      resetOverride,
      isVariableOverride,
    }),
    [
      selectedRows,
      setSelectedRows,
      selectRow,
      isRowSelected,
      areTfVarsFilesLoading,
      tfVarFiles,
      tfVarFilePaths,
      variableRows,
      hoveredRow,
      resetOverride,
      setTfVarFiles,
      addCustomVariable,
      deleteSelectedRows,
      setFileListOrder,
      focusedCell,
      setFocusedCell,
      fetchTfVarsFiles,
      newPath,
      setNewPath,
      submitNewPath,
      newPathErrorMessage,
      setNewPathErrorMessage,
      hoveredCell,
      setHoveredCell,
      isVariableOverride,
      getVariableValue,
      overrideValue,
      getVariableSource,
      isCustomVariable,
      toggleSecret,
      overrides,
      overrideKey,
    ]
  )

  return <TerraformVariablesContext.Provider value={value}>{children}</TerraformVariablesContext.Provider>
}

export function useTerraformVariablesContext() {
  const context = useContext(TerraformVariablesContext)
  if (context === undefined) {
    throw new Error('useTerraformVariablesContext must be used within a TerraformVariablesProvider')
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
      className="grid grid-cols-[1fr_40px] items-center justify-between border-b border-neutral-250 px-4 py-3 last:rounded-b-lg last:border-b-0 hover:bg-neutral-100"
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
  const {
    tfVarFiles,
    setFileListOrder,
    newPath,
    setNewPath,
    submitNewPath,
    areTfVarsFilesLoading,
    newPathErrorMessage,
    setNewPathErrorMessage,
  } = useTerraformVariablesContext()

  const onIndexChange = (file: TfVarsFile, newIndex: number) => {
    const currentIndex = tfVarFiles.indexOf(file)
    const newFiles = [...tfVarFiles]
    const element = newFiles[currentIndex]
    newFiles.splice(currentIndex, 1)
    newFiles.splice(newIndex, 0, element)
    setFileListOrder(newFiles.map((file) => file.source))
  }

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPath(e.target.value)
    setNewPathErrorMessage(undefined)
  }, [])

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
      <Popover.Content side="right" className="flex w-[340px] flex-col rounded-lg border border-neutral-250 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="px-1 py-1 text-sm font-medium text-neutral-400">Add and order .tfvars files</span>
          <Popover.Close>
            <button type="button" className="px-1 py-1">
              <Icon iconName="xmark" className="text-lg font-normal leading-4 text-neutral-350" />
            </button>
          </Popover.Close>
        </div>
        <div className="flex flex-col gap-2 border-t border-neutral-250 px-4 py-3">
          <div className="relative">
            <InputTextSmall
              name="path"
              value={newPath}
              onChange={onInputChange}
              placeholder="Path of .tfvar file"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitNewPath()
                }
              }}
              inputClassName={newPath.length > 0 ? 'pr-9' : undefined}
              disabled={areTfVarsFilesLoading}
              spellCheck={false}
            />
            {areTfVarsFilesLoading && newPath.length > 0 ? (
              <div className="absolute right-0 top-0 flex h-full w-9 items-center justify-center">
                <LoaderSpinner />
              </div>
            ) : (
              <button className="absolute right-0 top-0 h-full w-9" type="button" onClick={submitNewPath}>
                <Icon iconName="plus" className="text-lg font-normal leading-4 text-neutral-350" />
              </button>
            )}
          </div>
          {newPathErrorMessage && <div className="text-xs text-red-500">{newPathErrorMessage}</div>}
        </div>
        <div className="flex items-center justify-between border-t border-neutral-250 bg-neutral-100 px-4 py-1">
          <span className="text-xs text-neutral-350">File order defines override priority.</span>
          <Tooltip
            classNameContent="max-w-[230px]"
            content="Files higher in the list override variables from lower ones."
            side="left"
          >
            <span className="text-sm text-neutral-350">
              <Icon iconName="info-circle" iconStyle="regular" />
            </span>
          </Tooltip>
        </div>
        <div className="flex flex-col border-t border-neutral-250">
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
    <div className="flex items-center justify-center border-b border-t border-neutral-250 bg-neutral-100 p-4">
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

const getSourceBadgeColor = (isOverride: boolean, isCustom: boolean) => {
  if (isOverride) {
    return 'tf_override'
  }
  if (isCustom) {
    return 'tf_custom'
  }
  return 'tf_main'
}

const VariableRow = ({ row }: { row: VariableRowItem }) => {
  const {
    selectRow,
    isRowSelected,
    hoveredRow,
    resetOverride,
    focusedCell,
    setFocusedCell,
    hoveredCell,
    setHoveredCell,
    isCustomVariable,
    isVariableOverride,
    getVariableValue,
    overrideValue,
    getVariableSource,
    toggleSecret,
    overrideKey,
  } = useTerraformVariablesContext()
  const { environmentId = '' } = useParams()
  const [isVariablePopoverOpen, setIsVariablePopoverOpen] = useState(false)
  const isCellFocused = useCallback(
    (cell: 'key' | 'value') => focusedCell === `${row.key}-${cell}`,
    [focusedCell, row.key]
  )
  const isCellHovered = useMemo(() => hoveredCell === row.key, [hoveredCell, row.key])

  return (
    <div className="w-full border-b border-neutral-250">
      <div
        className={twMerge(
          'grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center',
          hoveredRow ? (hoveredRow === getVariableSource(row.key) ? 'bg-neutral-100' : 'bg-white') : 'bg-white',
          isRowSelected(row.key) && 'bg-neutral-150 hover:bg-neutral-150'
        )}
      >
        <div className="flex h-full items-center justify-center border-r border-neutral-250">
          <Checkbox
            checked={isRowSelected(row.key)}
            onCheckedChange={() => selectRow(row.key)}
            disabled={!isCustomVariable(row.key)}
          />
        </div>
        {/* Variable name cell */}
        <div
          className={twMerge(
            'flex h-full items-center border-r border-neutral-250 transition-all duration-100',
            isCustomVariable(row.key) && 'hover:bg-neutral-100',
            (isCellFocused('key') || isRowSelected(row.key)) && 'bg-neutral-150 hover:bg-neutral-150'
          )}
        >
          {isCustomVariable(row.key) ? (
            <input
              name="key"
              value={row.key}
              onChange={(e) => {
                const newKey = e.target.value
                overrideKey(row.key, newKey)
                setFocusedCell(`${newKey}-key`)
              }}
              className={twMerge(
                'peer h-full w-full bg-transparent px-4 text-sm outline-none',
                isCellFocused('key') && 'bg-neutral-150 hover:bg-neutral-150'
              )}
              onFocus={() => setFocusedCell(`${row.key}-key`)}
              onBlur={() => setFocusedCell(undefined)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              placeholder="Variable name"
              spellCheck={false}
            />
          ) : (
            <span className="px-4 text-sm text-neutral-350">{row.key}</span>
          )}
        </div>
        {/* Variable value cell */}
        <div
          className="group relative flex h-full cursor-text items-center border-r border-neutral-250"
          onMouseEnter={() => setHoveredCell(row.key)}
          onMouseLeave={(e) => {
            if (e.relatedTarget === window) {
              return
            }
            setHoveredCell(undefined)
          }}
        >
          {/* Background */}
          <div
            className={twMerge(
              'pointer-events-none absolute bottom-0 left-0 right-0 top-0 h-full w-full transition-all duration-100 group-hover:bg-neutral-100',
              isCellFocused('value') && 'bg-neutral-150 group-hover:bg-neutral-150'
            )}
          />
          {/* Cell content */}
          <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full">
            {row.secret ? (
              <PasswordShowHide
                value=""
                isSecret={true}
                defaultVisible={false}
                className="h-full w-full px-4 text-sm text-neutral-400 outline-none"
              />
            ) : (
              <input
                name="value"
                value={getVariableValue(row.key)}
                onChange={(e) => {
                  overrideValue(row.key, e.target.value)
                }}
                onFocus={() => setFocusedCell(`${row.key}-value`)}
                onBlur={() => setFocusedCell(undefined)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                className="h-full w-full bg-transparent px-4 text-sm text-neutral-400 outline-none"
                spellCheck={false}
                placeholder="Variable value"
              />
            )}
            <div
              className={twMerge(
                'absolute right-0 top-0 mr-4 flex h-full translate-x-1 items-center gap-2 pl-3 opacity-0 transition-all duration-100 group-hover:bg-neutral-100',
                isCellFocused('value') && 'bg-neutral-150 group-hover:bg-neutral-150',
                isCellHovered && 'translate-x-0 opacity-100',
                isVariablePopoverOpen && 'bg-white'
              )}
            >
              {!row.secret && (
                <DropdownVariable
                  environmentId={environmentId}
                  onChange={(val) => {
                    overrideValue(row.key, val)
                  }}
                  onOpenChange={(open) => {
                    if (open) {
                      setHoveredCell(row.key)
                      setFocusedCell(undefined)
                    } else {
                      setHoveredCell(undefined)
                      setFocusedCell(undefined)
                    }
                    setIsVariablePopoverOpen(open)
                  }}
                >
                  <button
                    className={twMerge(
                      'justify-center border-none bg-transparent px-1 text-neutral-350 hover:text-neutral-400'
                    )}
                    type="button"
                  >
                    <Icon className="text-sm" iconName="wand-magic-sparkles" />
                  </button>
                </DropdownVariable>
              )}
              {!isCustomVariable(row.key) && isVariableOverride(row.key) && (
                <button
                  type="button"
                  onClick={() => resetOverride(row.key)}
                  className="mx-4 px-1 text-neutral-350 hover:text-neutral-400"
                >
                  <Icon iconName="rotate-left" iconStyle="regular" />
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Source badge */}
        <div className="flex h-full items-center border-r border-neutral-250 px-4">
          <Badge
            color={getSourceBadgeColor(isVariableOverride(row.key), isCustomVariable(row.key))}
            variant="surface"
            className="text-xs"
          >
            <Truncate text={getVariableSource(row.key)} truncateLimit={40} />
          </Badge>
        </div>
        {/* Secret toggle */}
        <button
          className="flex items-center justify-center text-center text-sm text-neutral-400"
          type="button"
          onClick={() => {
            toggleSecret(row.key, !row.secret)
          }}
        >
          <Icon
            iconName={row.secret ? 'lock-keyhole' : 'lock-keyhole-open'}
            iconStyle="regular"
            className={row.secret ? 'text-neutral-400' : 'text-neutral-300'}
          />
        </button>
      </div>
    </div>
  )
}

const TerraformVariablesRows = () => {
  const { variableRows, overrides, isCustomVariable, setSelectedRows, selectedRows } = useTerraformVariablesContext()
  const customVariables = useMemo(() => overrides.filter((o) => isCustomVariable(o.key)), [overrides, isCustomVariable])
  const isAllSelected = useMemo(
    () => selectedRows.length === customVariables.length && customVariables.length > 0,
    [selectedRows, customVariables]
  )
  const isSelectAllCheckboxEnabled = useMemo(() => customVariables.length > 0, [customVariables])

  const onSelectAllToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(customVariables.map((o) => o.key))
      } else {
        setSelectedRows([])
      }
    },
    [customVariables, setSelectedRows]
  )

  return (
    <div className="flex flex-col items-center justify-center border-t border-neutral-250">
      <div className="grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center border-b border-neutral-250 bg-neutral-100">
        <div className="flex h-full items-center justify-center border-r border-neutral-250">
          <Checkbox
            disabled={!isSelectAllCheckboxEnabled}
            onCheckedChange={onSelectAllToggle}
            checked={isAllSelected}
          />
        </div>
        <div className="flex h-full items-center border-r border-neutral-250">
          <span className="px-4 text-sm text-neutral-400">Variable</span>
        </div>
        <div className="flex h-full items-center border-r border-neutral-250">
          <span className="px-4 text-sm text-neutral-400">Value</span>
        </div>
        <div className="flex h-full items-center border-r border-neutral-250">
          <span className="px-4 text-sm text-neutral-400">Source</span>
        </div>
      </div>

      {variableRows.map((row, index) => (
        <VariableRow key={index} row={row} />
      ))}
    </div>
  )
}

const TerraformVariablesLoadingState = () => {
  return (
    <div className="flex items-center justify-center border-b border-t border-neutral-250 bg-neutral-100 p-4">
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

export const TerraformVariablesTable = () => {
  const {
    selectedRows,
    areTfVarsFilesLoading,
    addCustomVariable,
    deleteSelectedRows,
    variableRows,
    fetchTfVarsFiles,
    newPath,
  } = useTerraformVariablesContext()

  useEffect(() => {
    fetchTfVarsFiles()
  }, [])

  return (
    <div className="flex flex-col rounded-lg border border-neutral-250">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-neutral-400">Variable configuration</span>
        <TfvarsFilesPopover />
      </div>

      {areTfVarsFilesLoading && newPath.length === 0 ? (
        <TerraformVariablesLoadingState />
      ) : variableRows.length > 0 ? (
        <TerraformVariablesRows />
      ) : (
        <TerraformVariablesEmptyState />
      )}

      <div
        className={twMerge('flex items-center px-4 py-3', selectedRows.length > 0 ? 'justify-between' : 'justify-end')}
      >
        {selectedRows.length > 0 && (
          <Button size="md" variant="solid" color="red" className="gap-1.5" type="button" onClick={deleteSelectedRows}>
            <Icon iconName="trash-can" iconStyle="regular" />
            Delete selected
          </Button>
        )}
        <Button size="md" variant="surface" className="gap-1.5" type="button" onClick={addCustomVariable}>
          Add variable
          <Icon iconName="plus" iconStyle="regular" />
        </Button>
      </div>
    </div>
  )
}

export const TerraformVariablesSettings = () => {
  return (
    <div className="space-y-10">
      <Section className="space-y-2">
        <Heading level={1}>Configure Terrafrom Variables</Heading>
        <p className="text-sm text-neutral-350">
          Select .tfvars files and configure variable values for your Terraform deployment
        </p>
      </Section>

      <TerraformVariablesTable />
    </div>
  )
}
