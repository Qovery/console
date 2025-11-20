import { type CheckedState } from '@radix-ui/react-checkbox'
import { type AxiosError } from 'axios'
import { Reorder } from 'framer-motion'
import {
  GitProviderEnum,
  type TerraformVarKeyValue,
  type TerraformVariableDefinition,
  type TfVarsFileResponse,
} from 'qovery-typescript-axios'
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { v4 as uuidv4 } from 'uuid'
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
  ScrollShadowWrapper,
  Section,
  Skeleton,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type TerraformGeneralData } from '../terraform-configuration-settings/terraform-configuration-settings'

const CUSTOM_SOURCE = 'Custom'

type UIVariable = {
  id: string
  key: string
  value: string
  source: string
  // current secret flag shown in UI
  secret: boolean
  // originals (used to detect changes)
  originalKey?: string
  originalValue?: string
  originalSecret?: boolean
  // metadata
  isNew?: boolean // created by user in UI (always treated as changed)
}

type TfVarsFile = TfVarsFileResponse & {
  enabled: boolean
}

type TerraformVariablesContextType = {
  vars: UIVariable[]
  addVariable: (key?: string, value?: string) => void
  updateKey: (id: string, key: string) => void
  updateValue: (id: string, value: string) => void
  toggleSecret: (id: string) => void
  revertValue: (id: string) => void
  removeVariable: (id: string) => void
  serializeForApi: () => { key?: string; value?: string; secret?: boolean }[]

  // TFVARS-related
  fetchTfVarsFiles: () => void
  tfVarFiles: TfVarsFile[]
  setTfVarFiles: (tfVarFiles: TfVarsFile[]) => void
  newPath: string
  setNewPath: (newPath: string) => void
  submitNewPath: () => void
  areTfVarsFilesLoading: boolean
  newPathErrorMessage: string | undefined
  setNewPathErrorMessage: (newPathErrorMessage: string | undefined) => void
  setFileListOrder: (fileListOrder: string[]) => void

  // Table-related
  selectedRows: string[]
  setSelectedRows: (selectedRows: string[]) => void
  deleteSelectedRows: () => void
  isRowSelected: (id: string) => boolean
  selectRow: (id: string) => void
  hoveredRow: string | undefined
  setHoveredRow: (hoveredRow: string | undefined) => void
  errors: Map<string, string>
}

const TerraformVariablesContext = createContext<TerraformVariablesContextType | undefined>(undefined)

const isVariableChanged = (v: UIVariable): boolean => {
  // New variables are always considered changed
  if (v.isNew) return true

  // If originals are undefined (defensive), treat as changed
  const origKey = v.originalKey ?? undefined
  const origVal = v.originalValue ?? undefined
  const origSecret = v.originalSecret ?? undefined

  // Compare key, value and secret strictly
  const keyChanged = v.key !== origKey
  const valueChanged = v.value !== origVal
  const secretChanged = v.secret !== origSecret

  return keyChanged || valueChanged || secretChanged
}

const formatSource = (v: UIVariable) => {
  return isVariableChanged(v) && v.source !== CUSTOM_SOURCE ? `Override from ${v.source}` : v.source
}

const isCustomVariable = (v: UIVariable) => {
  return v.source === CUSTOM_SOURCE
}

export const TerraformVariablesProvider = ({ children }: PropsWithChildren) => {
  // Initial data fetching...
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
  const [newPath, setNewPath] = useState<string>('')
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

  // Save list order
  const [fileListOrder, setFileListOrder] = useState<string[]>([])

  // Transform the response data and memoize based on content, not reference
  const tfVarFilesFromResponse = useMemo(() => {
    const serviceTfPaths = service?.terraform_variables_source.tf_var_file_paths
    return tfVarFilesResponse.map((file) => ({
      ...file,
      enabled: serviceTfPaths?.includes(file.source) ?? false,
    }))
  }, [tfVarFilesResponse, service?.terraform_variables_source.tf_var_file_paths])

  // Allow manual override of file enabled state
  const [fileEnabledOverrides, setFileEnabledOverrides] = useState<Record<string, boolean>>({})

  const setTfVarFiles = useCallback((newFiles: TfVarsFile[]) => {
    const overrides: Record<string, boolean> = {}
    newFiles.forEach((file) => {
      overrides[file.source] = file.enabled
    })
    setFileEnabledOverrides(overrides)
  }, [])

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

  const groupedInitialVars = useMemo(
    () => [...(variablesResponse ?? []), ...filesVars, ...(service?.terraform_variables_source?.tf_vars ?? [])],
    [variablesResponse, service?.terraform_variables_source?.tf_vars, filesVars]
  )

  const variableByKey = useMemo(() => {
    return [...(variablesResponse ?? []), ...filesVars].reduce(
      (acc, variable) => {
        if (variable) {
          acc[variable.key ?? ''] = variable
        }
        return acc
      },
      {} as Record<string, TerraformVariableDefinition | TerraformVarKeyValue>
    )
  }, [variablesResponse, filesVars])

  // initialVars regroups variables from the git repo and the service's tf_vars. It is used to populate the initial state of the variables. Each variable key must be unique. If a variable key is present in both the git repo and the service's tf_vars, the value from the service's tf_vars is used.
  const initialVars: UIVariable[] = useMemo(() => {
    const uniqueVars = new Map<string, UIVariable>()
    groupedInitialVars?.forEach((variable) => {
      const currentVariable = variableByKey[variable.key ?? '']
      const originalValue =
        currentVariable && 'value' in currentVariable
          ? currentVariable.value ?? ''
          : currentVariable && 'default' in currentVariable
            ? currentVariable.default ?? ''
            : ''
      const source = currentVariable && 'source' in currentVariable ? currentVariable.source : CUSTOM_SOURCE
      const value = 'value' in variable ? variable.value ?? '' : 'default' in variable ? variable.default ?? '' : ''
      uniqueVars.set(variable.key ?? '', {
        id: uuidv4(),
        key: variable.key ?? '',
        value,
        originalKey: variable.key,
        originalValue,
        originalSecret:
          'sensitive' in variable ? variable.sensitive : 'secret' in variable ? Boolean(variable.secret) : false,
        source,
        secret: 'sensitive' in variable ? variable.sensitive : 'secret' in variable ? Boolean(variable.secret) : false,
        isNew: false,
      })
    })
    return Array.from(uniqueVars.values())
  }, [groupedInitialVars, variableByKey])

  const [vars, setVars] = useState<UIVariable[]>([])

  // Create a stable signature from the actual variable data (excluding IDs which change every render)
  const initialVarsSignature = useMemo(() => {
    return JSON.stringify(
      groupedInitialVars?.map((v) => ({
        key: v.key,
        value: 'default' in v ? v.default : 'value' in v ? v.value : '',
        source: 'source' in v ? v.source : '',
        secret: 'sensitive' in v ? v.sensitive : 'secret' in v ? Boolean(v.secret) : false,
      })) ?? []
    )
  }, [groupedInitialVars])
  const previousSignatureRef = useRef<string>('')

  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [hoveredRow, setHoveredRow] = useState<string | undefined>(undefined)

  const errors = useMemo(() => {
    const newErrors = new Map<string, string>()
    vars.forEach((v) => {
      const duplicate = vars.find((v2) => v.key === v2.key && v.id !== v2.id && v.isNew)
      if (duplicate) {
        newErrors.set(v.id, `Variable "${v.key}" already exists`)
      }
    })
    return newErrors
  }, [vars])

  const isRowSelected = useCallback(
    (id: string) => {
      return selectedRows.includes(id)
    },
    [selectedRows]
  )

  const selectRow = useCallback((id: string) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(id)) {
        return prevSelectedRows.filter((row) => row !== id)
      } else {
        return [...prevSelectedRows, id]
      }
    })
  }, [])

  // Delete the selected rows from the overrides array and clear the selected rows
  const deleteSelectedRows = useCallback(() => {
    setVars((prev) => prev.filter((v) => !selectedRows.includes(v.id)))
    setSelectedRows([])
  }, [selectedRows])

  const serializeForApi = useCallback(
    () =>
      vars
        .filter((v) => isVariableChanged(v) || isCustomVariable(v)) // Only serialize variables that are changed or custom
        .map((v) => ({
          key: v.key,
          value: v.value,
          secret: v.secret,
        })),
    [vars]
  )

  useEffect(() => {
    // Only initialize vars when the actual variable data changes (not just reference changes)
    if (initialVars.length > 0 && initialVarsSignature !== previousSignatureRef.current) {
      setVars(initialVars)
      previousSignatureRef.current = initialVarsSignature
    }
  }, [initialVars, initialVarsSignature])

  const addVariable = useCallback((key = '', value = '') => {
    const newVar: UIVariable = {
      id: uuidv4(),
      key,
      value,
      source: CUSTOM_SOURCE,
      secret: false,
      // no originals for new items (or explicitly undefined) — treated as changed
      originalKey: undefined,
      originalValue: undefined,
      originalSecret: undefined,
      isNew: true,
    }
    setVars((prev) => [...prev, newVar])
  }, [])

  const updateKey = useCallback((id: string, key: string) => {
    setVars((prev) => prev.map((v) => (v.id === id ? { ...v, key } : v)))
  }, [])

  const updateValue = useCallback((id: string, value: string) => {
    setVars((prev) => prev.map((v) => (v.id === id ? { ...v, value } : v)))
  }, [])

  const toggleSecret = useCallback((id: string) => {
    setVars((prev) => prev.map((v) => (v.id === id ? { ...v, secret: !v.secret } : v)))
  }, [])

  const revertValue = useCallback((id: string) => {
    setVars((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              value: v.originalValue ?? '',
              isOverridden: false,
            }
          : v
      )
    )
  }, [])

  const removeVariable = useCallback((id: string) => {
    setVars((prev) => prev.filter((v) => v.id !== id))
  }, [])

  const value: TerraformVariablesContextType = useMemo(
    () => ({
      // Variables-related
      vars,
      addVariable,
      updateKey,
      updateValue,
      toggleSecret,
      revertValue,
      removeVariable,
      serializeForApi,
      errors,
      // Tfvars-related
      fetchTfVarsFiles,
      tfVarFiles,
      setTfVarFiles,
      newPath,
      setNewPath,
      submitNewPath,
      areTfVarsFilesLoading,
      newPathErrorMessage,
      setNewPathErrorMessage,
      setFileListOrder,
      // Table-related
      selectedRows,
      setSelectedRows,
      isRowSelected,
      selectRow,
      deleteSelectedRows,
      hoveredRow,
      setHoveredRow,
    }),
    [
      vars,
      addVariable,
      updateKey,
      updateValue,
      toggleSecret,
      revertValue,
      removeVariable,
      fetchTfVarsFiles,
      tfVarFiles,
      setTfVarFiles,
      newPath,
      setNewPath,
      submitNewPath,
      areTfVarsFilesLoading,
      newPathErrorMessage,
      setNewPathErrorMessage,
      setFileListOrder,
      serializeForApi,
      selectedRows,
      setSelectedRows,
      isRowSelected,
      selectRow,
      deleteSelectedRows,
      hoveredRow,
      setHoveredRow,
      errors,
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
  const { tfVarFiles, setTfVarFiles, setHoveredRow } = useTerraformVariablesContext()
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
      className="grid w-full grid-cols-[1fr_70px] items-center justify-between border-b border-neutral-250 px-4 py-3 last:rounded-b-lg last:border-b-0 hover:bg-neutral-100"
      onMouseEnter={() => setHoveredRow(file.source)}
      onMouseLeave={() => setHoveredRow(undefined)}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          name={file.source}
          id={file.source}
          checked={file.enabled}
          onCheckedChange={onCheckedChange}
          className="ml-1 cursor-pointer"
        />
        <label className="flex cursor-pointer flex-col gap-0.5 text-sm" htmlFor={file.source}>
          <span className="text-neutral-400">{file.source}</span>
          <span className="text-xs text-neutral-350">{Object.keys(file.variables).length} variables</span>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <Icon iconName="grip-lines" iconStyle="regular" className="text-neutral-350" />
        <div className="flex items-center gap-1.5">
          <span className="text-md leading-3 text-neutral-300">#</span>
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

  const onIndexChange = useCallback(
    (file: TfVarsFile, newIndex: number) => {
      const currentIndex = tfVarFiles.indexOf(file)
      const newFiles = [...tfVarFiles]
      const element = newFiles[currentIndex]
      newFiles.splice(currentIndex, 1)
      newFiles.splice(newIndex, 0, element)
      setFileListOrder(newFiles.map((file) => file.source))
    },
    [tfVarFiles, setFileListOrder]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPath(e.target.value)
    setNewPathErrorMessage(undefined)
  }

  const onReorder = (newFiles: TfVarsFile[]) => {
    setFileListOrder(newFiles.map((file) => file.source))
  }

  return (
    <Popover.Root defaultOpen={true}>
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
            <button type="button" className="flex items-center justify-center px-1 py-1">
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
          {areTfVarsFilesLoading && tfVarFiles.length === 0 ? (
            <>
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex w-full items-center gap-4 border-b border-neutral-250 px-4 py-4">
                  <div className="flex items-center">
                    <Skeleton height={16} width={16} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton height={14} width={200} />
                    <Skeleton height={8} width={90} />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <ScrollShadowWrapper className="max-h-[500px]">
              <Reorder.Group axis="y" values={tfVarFiles} onReorder={onReorder}>
                {tfVarFiles?.map((file, index) => (
                  <Reorder.Item
                    key={file.source}
                    value={file}
                    initial={{ cursor: 'grab' }}
                    exit={{ cursor: 'grab' }}
                    whileDrag={{ cursor: 'grabbing', borderColor: '#44C979', borderWidth: '2px' }}
                    className={twMerge('flex w-full items-center border-b border-neutral-250')}
                  >
                    <TfvarItem key={file.source} file={file} index={index} onIndexChange={onIndexChange} />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </ScrollShadowWrapper>
          )}
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
  if (isCustom) {
    return 'tf_custom'
  }
  if (isOverride) {
    return 'tf_override'
  }
  return 'tf_main'
}

const VariableRow = ({ variable }: { variable: UIVariable }) => {
  const { updateKey, updateValue, toggleSecret, revertValue, isRowSelected, selectRow, hoveredRow, errors } =
    useTerraformVariablesContext()
  const { environmentId = '' } = useParams()
  const [isVariablePopoverOpen, setIsVariablePopoverOpen] = useState(false)
  const [isCellHovered, setIsCellHovered] = useState(false)
  const [focusedCell, setFocusedCell] = useState<string | undefined>(undefined)
  const isCellFocused = useCallback((cell: 'key' | 'value') => focusedCell === cell, [focusedCell])

  return (
    <div className="w-full border-b border-neutral-250">
      <div
        className={twMerge(
          'grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center',
          hoveredRow ? (hoveredRow === variable.source ? 'bg-neutral-100' : 'bg-white') : 'bg-white',
          isRowSelected(variable.id) && 'bg-neutral-150 hover:bg-neutral-150'
        )}
      >
        <div className="flex h-full items-center justify-center border-r border-neutral-250">
          <Checkbox
            checked={isRowSelected(variable.id)}
            onCheckedChange={() => selectRow(variable.id)}
            disabled={!isCustomVariable(variable)}
          />
        </div>
        {/* Variable name cell */}
        <div
          className={twMerge(
            'h-full border-r border-neutral-250 transition-all duration-100',
            isCustomVariable(variable) && 'hover:bg-neutral-100',
            (isCellFocused('key') || isRowSelected(variable.id)) && 'bg-neutral-150 hover:bg-neutral-150'
          )}
        >
          <div
            className={twMerge(
              'flex h-full w-full items-center border border-transparent',
              errors.get(variable.id) && 'border-red-500'
            )}
          >
            {variable.isNew ? (
              <input
                name="key"
                value={variable.key}
                onChange={(e) => {
                  updateKey(variable.id, e.target.value)
                }}
                className={twMerge(
                  'peer h-full w-full bg-transparent px-4 text-sm outline-none',
                  isCellFocused('key') && 'bg-neutral-150 hover:bg-neutral-150'
                )}
                onFocus={() => setFocusedCell('key')}
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
              <span className="px-4 text-sm text-neutral-350">{variable.key}</span>
            )}
            {errors.get(variable.id) && (
              <Tooltip content={errors.get(variable.id)}>
                <div className="mr-4">
                  <Icon iconName="circle-exclamation" iconStyle="regular" className="text-red-500" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        {/* Variable value cell */}
        <div
          className="group relative flex h-full cursor-text items-center border-r border-neutral-250"
          onMouseEnter={() => {
            setIsCellHovered(true)
          }}
          onMouseLeave={(e) => {
            if (e.relatedTarget === window) {
              return
            }
            setIsCellHovered(false)
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
            {variable.secret ? (
              <PasswordShowHide
                value=""
                isSecret={true}
                defaultVisible={false}
                className="h-full w-full px-4 text-sm text-neutral-400 outline-none"
              />
            ) : (
              <input
                name="value"
                value={variable.value}
                onChange={(e) => {
                  updateValue(variable.id, e.target.value)
                }}
                onFocus={() => setFocusedCell('value')}
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
              {!variable.secret && (
                <DropdownVariable
                  environmentId={environmentId}
                  onChange={(val) => {
                    updateValue(variable.id, `{{${val}}}`)
                  }}
                  onOpenChange={(open) => {
                    if (open) {
                      setIsCellHovered(true)
                      setFocusedCell(undefined)
                    } else {
                      setIsCellHovered(false)
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

              {isVariableChanged(variable) && (
                <button
                  type="button"
                  onClick={() => revertValue(variable.id)}
                  className="px-1 text-neutral-350 hover:text-neutral-400"
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
            color={getSourceBadgeColor(isVariableChanged(variable), isCustomVariable(variable))}
            variant="surface"
            className="text-xs"
          >
            <Truncate text={formatSource(variable)} truncateLimit={40} />
          </Badge>
        </div>
        {/* Secret toggle */}
        <button
          className="flex items-center justify-center text-center text-sm text-neutral-400"
          type="button"
          onClick={() => {
            toggleSecret(variable.id)
          }}
        >
          <Icon
            iconName={variable.secret ? 'lock-keyhole' : 'lock-keyhole-open'}
            iconStyle="regular"
            className={variable.secret ? 'text-neutral-400' : 'text-neutral-300'}
          />
        </button>
      </div>
    </div>
  )
}

const TerraformVariablesRows = () => {
  const { vars, selectedRows, setSelectedRows } = useTerraformVariablesContext()
  const customVariables = useMemo(() => vars.filter((v) => isCustomVariable(v)), [vars])
  const isAllSelected = useMemo(
    () => selectedRows.length === customVariables.length && customVariables.length > 0,
    [selectedRows, customVariables]
  )
  const isSelectAllCheckboxEnabled = useMemo(() => customVariables.length > 0, [customVariables])

  const onSelectAllToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(customVariables.map((v) => v.id))
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

      {vars.map((variable, index) => (
        <VariableRow key={index} variable={variable} />
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
  const { addVariable, fetchTfVarsFiles, areTfVarsFilesLoading, vars, newPath, selectedRows, deleteSelectedRows } =
    useTerraformVariablesContext()

  useEffect(() => {
    fetchTfVarsFiles()
  }, [])

  const onAddVariable = useCallback(() => {
    addVariable('new_variable', 'value')
  }, [addVariable])

  return (
    <div className="flex flex-col rounded-lg border border-neutral-250">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-neutral-400">Variable configuration</span>
        <TfvarsFilesPopover />
      </div>

      {areTfVarsFilesLoading && newPath.length === 0 ? (
        <TerraformVariablesLoadingState />
      ) : vars.length > 0 ? (
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
        <Button size="md" variant="surface" className="gap-1.5" type="button" onClick={onAddVariable}>
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
        <Heading level={1}>Configure Terraform Variables</Heading>
        <p className="text-sm text-neutral-350">
          Select .tfvars files and configure variable values for your Terraform deployment
        </p>
      </Section>

      <TerraformVariablesTable />
    </div>
  )
}
