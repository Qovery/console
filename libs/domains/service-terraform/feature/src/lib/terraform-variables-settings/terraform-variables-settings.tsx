import { type CheckedState } from '@radix-ui/react-checkbox'
import { type AxiosError } from 'axios'
import { GitProviderEnum, type TerraformVarKeyValue, type TfVarsFileResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useListTfVarsFilesFromGitRepo } from '@qovery/domains/organizations/feature'
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
  Popover,
  Section,
  Tooltip,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type TerraformGeneralData } from '../terraform-configuration-settings/terraform-configuration-settings'

type TerraformVariablesContextType = {
  selectedRows: string[]
  onSelectRow: (key: string) => void
  isRowSelected: (key: string) => boolean
  areTfVarsFilesLoading: boolean
  tfVarFiles: TfVarsFile[]
  tfVarFilePaths: string[]
  tfVars: TerraformVarKeyValue[]
  setTfVarFiles: (tfVarFiles: TfVarsFile[]) => void
  variableRows: VariableRowItem[]
  hoveredRow: string | undefined
  setHoveredRow: (hoveredRow: string | undefined) => void
  customVariables: VariableRowItem[]
  setCustomVariable: (key: string, variable: VariableRowItem) => void
  resetCustomVariable: (key: string) => void
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
  const { getValues } = useFormContext<TerraformGeneralData>()
  const { organizationId = '' } = useParams()

  // Memoize the repository config to prevent unnecessary re-renders and refetches
  const formValues = getValues()
  const repositoryConfig = useMemo(() => {
    return {
      url: formValues.git_repository?.url ?? formValues.repository ?? '',
      branch: formValues.branch ?? '',
      root_path: formValues.root_path ?? '',
      git_token_id: formValues.git_repository?.git_token_id ?? '',
      provider: formValues.provider ?? GitProviderEnum.GITHUB,
    }
  }, [formValues])

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
              setTfVarFilesResponse(data)
            }
          },
        }
      )
    } catch (error) {
      console.error(error)
    }
  }, [fetchTfVars, organizationId, repositoryConfig, newPath])

  const areTfVarsFilesLoading = useMemo(() => tfVarsFilesStatus === 'loading', [tfVarsFilesStatus])
  const [customVariables, setCustomVariables] = useState<TerraformVariablesContextType['customVariables']>([])

  // Transform the response data and memoize based on content, not reference
  const tfVarFilesFromResponse = useMemo(() => tfVarFilesResponse.map(transformTfVarsFile), [tfVarFilesResponse])

  // Allow manual override of file enabled state
  const [fileEnabledOverrides, setFileEnabledOverrides] = useState<Record<string, boolean>>({})

  // Save list order
  const [fileListOrder, setFileListOrder] = useState<string[]>([])

  const tfVarFiles = useMemo(() => {
    return tfVarFilesFromResponse
      .sort((a, b) => fileListOrder.indexOf(a.source) - fileListOrder.indexOf(b.source))
      .map((file) => ({
        ...file,
        enabled: fileEnabledOverrides[file.source] ?? file.enabled,
      }))
  }, [tfVarFilesFromResponse, fileEnabledOverrides, fileListOrder])

  const setTfVarFiles = useCallback((newFiles: TfVarsFile[]) => {
    const overrides: Record<string, boolean> = {}
    newFiles.forEach((file) => {
      overrides[file.source] = file.enabled
    })
    setFileEnabledOverrides(overrides)
  }, [])

  const variableRows: TerraformVariablesContextType['variableRows'] = useMemo(() => {
    const vars = new Map<string, VariableRowItem>()
    const files = [...tfVarFiles.filter((file) => file.enabled)].reverse()
    // Add variables from .tfvars files
    files.forEach((file) => {
      Object.entries(file.variables).forEach(([key, value]) => {
        const customVar = customVariables.find((customVariable) => customVariable.key === key)
        vars.set(key, {
          key,
          value: customVar?.value ?? value, // If an override is set, use the override value
          source: file.source,
          secret: false, // TODO [QOV-1266] Are we keeping 'secret' here?
        })
      })
    })
    // Add custom variables
    customVariables.forEach((v) => !vars.has(v.key) && vars.set(v.key, v))
    return [...vars.values()]
  }, [tfVarFiles, customVariables])

  const [selectedRows, setSelectedRows] = useState<TerraformVariablesContextType['selectedRows']>([])
  const [hoveredRow, setHoveredRow] = useState<TerraformVariablesContextType['hoveredRow']>(undefined)
  const [focusedCell, setFocusedCell] = useState<TerraformVariablesContextType['focusedCell']>(undefined)

  const tfVarFilePaths: TerraformVariablesContextType['tfVarFilePaths'] = useMemo(() => {
    return tfVarFiles.filter((tfVarFile) => tfVarFile.enabled).map((tfVarFile) => tfVarFile.source ?? '')
  }, [tfVarFiles])

  const tfVars: TerraformVariablesContextType['tfVars'] = useMemo(() => {
    return variableRows.map(({ key, value, secret }) => ({
      key,
      value,
      secret,
    }))
  }, [variableRows])

  const isRowSelected = useCallback(
    (key: string) => {
      return selectedRows.includes(key)
    },
    [selectedRows]
  )

  const onSelectRow = useCallback((key: string) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(key)) {
        return prevSelectedRows.filter((row) => row !== key)
      } else {
        return [...prevSelectedRows, key]
      }
    })
  }, [])

  const setCustomVariable = useCallback((key: string, variable: VariableRowItem) => {
    setCustomVariables((prevCustomVariables) => {
      if (prevCustomVariables.find((customVariable) => customVariable.key === key)) {
        return prevCustomVariables.map((customVariable) => (customVariable.key === key ? variable : customVariable))
      } else {
        return [...prevCustomVariables, variable]
      }
    })
  }, [])

  const resetCustomVariable = useCallback((key: string) => {
    setCustomVariables((prevCustomVariables) =>
      prevCustomVariables.filter((customVariable) => customVariable.key !== key)
    )
  }, [])

  const addCustomVariable = useCallback(() => {
    setCustomVariables((prevCustomVariables) => {
      const currentCount = prevCustomVariables.length
      let newKey = 'custom_' + (currentCount + 1)
      const doesExist = (key: string) => prevCustomVariables.find((customVariable) => customVariable.key === key)
      while (doesExist(newKey)) {
        newKey = 'custom_' + (Number(newKey.split('_')[1]) + 1)
      }
      return [...prevCustomVariables, { key: newKey, value: '' }]
    })
  }, [])

  const deleteSelectedRows = useCallback(() => {
    setCustomVariables((prevCustomVariables) =>
      prevCustomVariables.filter((customVariable) => !selectedRows.includes(customVariable.key))
    )
    setSelectedRows([])
  }, [selectedRows])

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
            console.log('ERROR:', error)
            setNewPathErrorMessage((error as AxiosError).message)
          },
        }
      )
    } catch (error) {
      console.error(error)
    }
  }, [fetchTfVars, organizationId, repositoryConfig, newPath])

  const value: TerraformVariablesContextType = useMemo(
    () => ({
      selectedRows,
      onSelectRow,
      isRowSelected,
      areTfVarsFilesLoading,
      tfVarFiles,
      tfVarFilePaths,
      tfVars,
      variableRows,
      hoveredRow,
      setHoveredRow,
      customVariables,
      setCustomVariable,
      resetCustomVariable,
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
    }),
    [
      selectedRows,
      onSelectRow,
      isRowSelected,
      areTfVarsFilesLoading,
      tfVarFiles,
      tfVarFilePaths,
      variableRows,
      hoveredRow,
      customVariables,
      setCustomVariable,
      resetCustomVariable,
      setTfVarFiles,
      tfVars,
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
      className="grid grid-cols-[1fr_40px] items-center justify-between border-b border-neutral-200 px-4 py-3 last:rounded-b-lg last:border-b-0 hover:bg-neutral-100"
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
      <Popover.Content side="right" className="flex w-[340px] flex-col rounded-lg border border-neutral-200 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="px-1 py-1 text-sm font-medium text-neutral-400">Add and order .tfvars files</span>
          <Popover.Close>
            <button type="button" className="px-1 py-1">
              <Icon iconName="xmark" className="text-lg font-normal leading-4 text-neutral-350" />
            </button>
          </Popover.Close>
        </div>
        <div className="flex flex-col gap-2 border-t border-neutral-200 px-4 py-3">
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
  if (customVariable && !customVariable.source) {
    return 'neutral'
  }
  if (customVariable && customVariable.source) {
    return 'yellow'
  }
  // TODO [QOV-1266] Manage colors for most common sources
  return 'sky'
}

const VariableRow = ({ row }: { row: VariableRowItem }) => {
  const {
    onSelectRow,
    isRowSelected,
    hoveredRow,
    customVariables,
    setCustomVariable,
    resetCustomVariable,
    focusedCell,
    setFocusedCell,
  } = useTerraformVariablesContext()
  const { environmentId = '' } = useParams()
  const customVariable = useMemo(
    () => customVariables.find((customVar) => customVar.key === row.key),
    [customVariables, row.key]
  )
  const isCustom = useMemo(() => !!customVariable && !customVariable.source, [customVariable])
  const isOverride = useMemo(() => !!customVariable && !!customVariable.source, [customVariable])
  const customVarHasValue = useMemo(() => !!customVariable && !!customVariable.value, [customVariable])
  const isCellFocused = useCallback(
    (cell: 'key' | 'value') => focusedCell === `${row.key}-${cell}`,
    [focusedCell, row.key]
  )

  return (
    <div className="w-full border-b border-neutral-200">
      <div
        className={twMerge(
          'grid h-[44px] w-full grid-cols-[52px_1fr_1fr_1fr_60px] items-center',
          hoveredRow ? (hoveredRow === row.source ? 'bg-neutral-100' : 'bg-white') : 'bg-white',
          isRowSelected(row.key) && 'bg-neutral-150 hover:bg-neutral-150'
        )}
      >
        <div className="flex h-full items-center justify-center border-r border-neutral-200">
          <Checkbox
            checked={isRowSelected(row.key)}
            onCheckedChange={() => onSelectRow(row.key)}
            disabled={!isCustom}
          />
        </div>
        <div className="flex h-full items-center border-r border-neutral-200">
          {isCustom ? (
            <input
              name="key"
              value={row.key}
              onChange={(e) => {
                setCustomVariable(row.key, { ...row, key: e.target.value })
              }}
              className={twMerge(
                'peer h-full w-full bg-transparent px-4 text-sm outline-none',
                isCellFocused('key') && 'bg-neutral-150 hover:bg-neutral-150'
              )}
              onFocus={() => setFocusedCell(`${row.key}-key`)}
              placeholder="Variable name"
              spellCheck={false}
            />
          ) : (
            <span className="px-4 text-sm text-neutral-350">{row.key}</span>
          )}
        </div>
        <div
          className={twMerge(
            'group flex h-full cursor-text items-center border-r border-neutral-200 hover:bg-neutral-100',
            customVarHasValue && (isOverride || isCustom) && 'bg-neutral-100',
            isCellFocused('value') && 'bg-neutral-150 hover:bg-neutral-150'
          )}
        >
          <input
            name="value"
            value={row.value}
            onChange={(e) => {
              setCustomVariable(row.key, { ...row, value: e.target.value })
            }}
            onFocus={() => setFocusedCell(`${row.key}-value`)}
            className="h-full w-full bg-transparent px-4 text-sm text-neutral-400 outline-none"
            spellCheck={false}
            placeholder="Variable value"
          />
          <DropdownVariable
            environmentId={environmentId}
            onChange={(varValue) => {
              setCustomVariable(row.key, { ...row, value: varValue })
            }}
          >
            <button
              className={twMerge(
                'mr-4 hidden justify-center border-none bg-transparent text-neutral-300 hover:text-neutral-400',
                isCellFocused('value') && 'block'
              )}
            >
              <Icon className="text-sm" iconName="wand-magic-sparkles" />
            </button>
          </DropdownVariable>
          {customVariable && isOverride && (
            <button
              type="button"
              onClick={() => resetCustomVariable(customVariable.key)}
              className="pl-0 pr-4 text-neutral-300 hover:text-neutral-400"
            >
              <Icon iconName="rotate-left" iconStyle="regular" />
            </button>
          )}
        </div>
        <div className="flex h-full items-center border-r border-neutral-200 px-4">
          <Badge color={getSourceBadgeColor(row, customVariable)} className="text-xs">
            {isOverride ? 'Override from ' : ''}
            {row.source?.split('/').pop() || 'Custom'}
          </Badge>
        </div>
        <span className="flex items-center justify-center text-center text-sm text-neutral-400">
          <Icon
            iconName="lock-keyhole-open"
            iconStyle="regular"
            className={twMerge(row.secret ? 'text-brand-500' : 'text-neutral-300')}
          />
        </span>
      </div>
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

      {variableRows.map((row, index) => (
        <VariableRow key={index} row={row} />
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
    <div className="flex flex-col rounded-lg border border-neutral-200">
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
