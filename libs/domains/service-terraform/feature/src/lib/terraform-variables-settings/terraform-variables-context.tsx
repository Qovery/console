import { type AxiosError } from 'axios'
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
import { type TerraformGeneralData } from './terraform-configuration-settings/terraform-configuration-settings'
import { isCustomVariable, isVariableChanged } from './terraform-variables-utils'

export type UIVariable = {
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
  description?: string // variable description from Terraform file
}

export type TfVarsFile = TfVarsFileResponse & {
  enabled: boolean
}

export type TerraformVariablesContextType = {
  vars: UIVariable[]
  addVariable: (key?: string, value?: string) => void
  updateKey: (id: string, key: string) => void
  updateValue: (id: string, value: string) => void
  toggleSecret: (id: string) => void
  revertValue: (id: string) => void
  removeVariable: (id: string) => void
  serializeForApi: () => { key?: string; value?: string; secret?: boolean }[]

  // tfVars-related
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

  // Table-management-related
  selectedRows: string[]
  setSelectedRows: (selectedRows: string[]) => void
  deleteSelectedRows: () => void
  isRowSelected: (id: string) => boolean
  selectRow: (id: string) => void
  hoveredRow: string | undefined
  setHoveredRow: (hoveredRow: string | undefined) => void
  errors: Map<string, string>
}

export const CUSTOM_SOURCE = 'Custom'
export const SECRET_UNCHANGED_VALUE = 'SECRET_VALUE_UNCHANGED'

export const TerraformVariablesContext = createContext<TerraformVariablesContextType | undefined>(undefined)

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
      if (!newPath.endsWith('.tfvars')) {
        setNewPathErrorMessage('The path must end with .tfvars')
        return
      }

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

  // Save tfVars file list order
  const [fileListOrder, setFileListOrder] = useState<string[]>([])

  // Transform the tfVars file response data and memoize based on content, not reference
  const tfVarFilesFromResponse = useMemo(() => {
    const serviceTfPaths = service?.terraform_variables_source.tf_var_file_paths
    return tfVarFilesResponse.map((file) => ({
      ...file,
      enabled: serviceTfPaths?.includes(file.source) ?? false,
    }))
  }, [tfVarFilesResponse, service?.terraform_variables_source.tf_var_file_paths])

  // Allow manual override of tfVars file enabled state
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

  // Separate lookup for descriptions to ensures descriptions are preserved
  // even when variables are overridden by tfvars files or manual overrides
  const descriptionByKey = useMemo(() => {
    return Object.fromEntries(
      (variablesResponse ?? [])
        .filter((variable) => variable?.key)
        .map((variable) => [variable.key, variable.description ?? undefined])
    )
  }, [variablesResponse])

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
      const originalSecret =
        currentVariable && 'sensitive' in currentVariable
          ? currentVariable.sensitive
          : currentVariable && 'secret' in currentVariable
            ? Boolean(currentVariable.secret)
            : false
      const source = currentVariable && 'source' in currentVariable ? currentVariable.source : CUSTOM_SOURCE
      const value = 'value' in variable ? variable.value ?? '' : 'default' in variable ? variable.default ?? '' : ''
      const secret =
        'sensitive' in variable ? variable.sensitive : 'secret' in variable ? Boolean(variable.secret) : false
      const description = descriptionByKey[variable.key ?? '']
      uniqueVars.set(variable.key ?? '', {
        id: uuidv4(),
        key: variable.key ?? '',
        value,
        originalKey: variable.key,
        originalValue,
        originalSecret,
        source,
        secret,
        isNew: false,
        description,
      })
    })
    return Array.from(uniqueVars.values())
  }, [groupedInitialVars, variableByKey, descriptionByKey])

  const [vars, setVars] = useState<UIVariable[]>([])

  // Create a stable signature from the initial variable data (excluding IDs which change every render)
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

  // Delete the selected rows from the variables array and clear the selected rows
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
    // Only initialize vars when the initial variable data changes (not just reference changes)
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
      // no originals for new variables (or explicitly undefined) — treated as changed
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
    setVars((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              secret: !v.secret,
              // If it is currently a secret and the value is the unchanged value, set the value to an empty string
              value: v.secret && v.value === SECRET_UNCHANGED_VALUE ? '' : v.value,
            }
          : v
      )
    )
  }, [])

  const revertValue = useCallback((id: string) => {
    setVars((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              value: v.originalValue ?? '',
              secret: v.originalSecret ?? false,
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
