import { useParams } from '@tanstack/react-router'
import equal from 'fast-deep-equal'
import {
  type Cluster,
  type ClusterPlatformConfigurationRequest,
  type ClusterPlatformConfigurationResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'
import { toast } from '@qovery/shared/ui'
import { type CatalogVariableValue, getCatalogVariableValue } from '@qovery/shared/util-js'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { useDeployCluster } from '../hooks/use-deploy-cluster/use-deploy-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformConfiguration } from '../platform-configuration/hooks/use-platform-configuration'
import { useUpdatePlatformConfiguration } from '../platform-configuration/hooks/use-update-platform-configuration'
import {
  type PlatformFieldDescriptor,
  type PlatformScalarField,
  applyPlatformConfigurationDefaults,
  isPlatformScalarField,
  omitEmptyValues,
  toPlatformCloudVendor,
  toPlatformClusterMode,
  updateComponentValue,
} from '../platform-configuration/platform-configuration-utils'
import { type ProfileTreeItem, getProfileTree } from './profile-tree'

export type ProfileValues = Record<string, Record<string, unknown>>
export type ClusterInputValues = Record<string, Record<string, string>>

// Scalars are compared as the inputs display them: an unset toggle shows as off, an unset text as empty.
function getDisplayedScalarValue(field: PlatformScalarField, value: unknown) {
  return getCatalogVariableValue(field, value) ?? (field.type === 'bool' ? false : '')
}

// Local edits differing from the saved (or default) value; edits reverted by hand do not count.
function countProfileChanges(
  profileTree: ProfileTreeItem[],
  configuration: ClusterPlatformConfigurationResponse | null | undefined,
  profileValues: ProfileValues,
  clusterInputs: ClusterInputValues
) {
  const fieldsByComponent = new Map(
    profileTree.flatMap((layer) => layer.children).map((component) => [component.key, component.fields])
  )
  const profileChanges = Object.entries(profileValues).flatMap(([componentKey, values]) => {
    const fields = fieldsByComponent.get(componentKey) ?? []
    const savedValues = applyPlatformConfigurationDefaults(
      fields,
      configuration?.platform.managedConfig?.[componentKey] ?? {}
    )
    return Object.entries(values).filter(([fieldKey, value]) => {
      const field = fields.find(({ key }) => key === fieldKey)
      return field && isPlatformScalarField(field)
        ? getDisplayedScalarValue(field, value) !== getDisplayedScalarValue(field, savedValues[fieldKey])
        : !equal(value, savedValues[fieldKey])
    })
  })
  const clusterInputChanges = Object.entries(clusterInputs).flatMap(([componentKey, values]) =>
    Object.entries(values).filter(
      ([inputKey, value]) => value !== (configuration?.clusterInputs[componentKey]?.[inputKey] ?? '')
    )
  )

  return profileChanges.length + clusterInputChanges.length
}

// PUT replaces the whole configuration: unedited components and inputs are sent back as saved.
function getConfigurationRequest(
  template: PlatformTemplateSummaryResponse,
  configuration: ClusterPlatformConfigurationResponse | null | undefined,
  profileValues: ProfileValues,
  clusterInputs: ClusterInputValues
): ClusterPlatformConfigurationRequest {
  const savedManagedConfig = configuration?.platform.managedConfig
  const managedConfig = { ...savedManagedConfig }
  for (const [componentKey, values] of Object.entries(profileValues)) {
    managedConfig[componentKey] = omitEmptyValues({ ...savedManagedConfig?.[componentKey], ...values })
  }
  const nextClusterInputs = { ...configuration?.clusterInputs }
  for (const [componentKey, values] of Object.entries(clusterInputs)) {
    nextClusterInputs[componentKey] = { ...configuration?.clusterInputs[componentKey], ...values }
  }

  return {
    platform: {
      templateKey: configuration?.platform.templateKey ?? template.key,
      templateVersion: configuration?.platform.templateVersion ?? template.version,
      layerSelections: configuration?.platform.layerSelections,
      managedConfig,
    },
    clusterInputs: nextClusterInputs,
  }
}

interface ClusterProfileContextValue {
  organizationId: string
  clusterId: string
  cluster?: Cluster
  templates?: PlatformTemplateSummaryResponse[]
  configuration?: ClusterPlatformConfigurationResponse | null
  profileTree: ProfileTreeItem[]
  isLoading: boolean
  isError: boolean
  // Unsaved edits, keyed by component then field.
  profileValues: ProfileValues
  clusterInputs: ClusterInputValues
  // Changes on reset: some inputs are uncontrolled, remounting the form shows the saved values again.
  formKey: number
  changeCount: number
  isSaving: boolean
  isDeploying: boolean
  updateProfileConfig: (componentKey: string, fieldKey: string, value: unknown) => void
  updateClusterInput: (componentKey: string, field: PlatformFieldDescriptor, value: CatalogVariableValue) => void
  resetChanges: () => void
  saveChanges: () => Promise<void>
  saveAndDeployChanges: () => Promise<void>
}

const ClusterProfileContext = createContext<ClusterProfileContextValue | undefined>(undefined)

export function ClusterProfileProvider({ children }: PropsWithChildren) {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const [profileValues, setProfileValues] = useState<ProfileValues>({})
  const [clusterInputs, setClusterInputs] = useState<ClusterInputValues>({})
  const [formKey, setFormKey] = useState(0)
  const [isSaveAndDeployPending, setIsSaveAndDeployPending] = useState(false)
  const { mutateAsync: updatePlatformConfiguration, isLoading: isSavingConfiguration } =
    useUpdatePlatformConfiguration()
  const { mutateAsync: deployCluster } = useDeployCluster()
  const {
    data: cluster,
    isError: isClusterError,
    isLoading: isClusterLoading,
  } = useCluster({
    organizationId,
    clusterId,
  })
  const clusterMode = toPlatformClusterMode(cluster?.kubernetes)
  const cloudProvider = toPlatformCloudVendor(cluster?.cloud_provider)
  const {
    data: templates,
    isError: isTemplateError,
    isLoading: isTemplateLoading,
  } = usePlatformTemplates({
    organizationId,
    clusterMode,
    cloudProvider,
    enabled: Boolean(clusterMode && cloudProvider),
  })
  const {
    data: configuration,
    isError: isConfigurationError,
    isLoading: isConfigurationLoading,
  } = usePlatformConfiguration({ clusterId })
  const selectedTemplate = useMemo(
    () =>
      templates?.find(
        (template) =>
          template.key === configuration?.platform.templateKey &&
          template.version === configuration?.platform.templateVersion
      ) ?? templates?.[0],
    [configuration?.platform.templateKey, configuration?.platform.templateVersion, templates]
  )
  const profileTree = useMemo(() => getProfileTree(selectedTemplate), [selectedTemplate])

  const updateProfileConfig = (componentKey: string, fieldKey: string, value: unknown) => {
    setProfileValues((currentValues) => updateComponentValue(currentValues, componentKey, fieldKey, value))
  }

  const updateClusterInput = (componentKey: string, field: PlatformFieldDescriptor, value: CatalogVariableValue) => {
    setClusterInputs((currentValues) => updateComponentValue(currentValues, componentKey, field.key, String(value)))
  }

  const resetChanges = () => {
    setProfileValues({})
    setClusterInputs({})
    setFormKey((key) => key + 1)
  }

  const saveConfiguration = async () => {
    if (!selectedTemplate) return
    await updatePlatformConfiguration({
      clusterId,
      configurationRequest: getConfigurationRequest(selectedTemplate, configuration, profileValues, clusterInputs),
    })
    // The saved configuration now carries the edits, so the local copies can go.
    setProfileValues({})
    setClusterInputs({})
  }

  const saveChanges = async () => {
    try {
      await saveConfiguration()
      toast('success', 'Profile saved', 'Deploy the cluster to apply the changes.')
    } catch {
      // Errors are notified by the mutation.
    }
  }

  const saveAndDeployChanges = async () => {
    setIsSaveAndDeployPending(true)
    try {
      await saveConfiguration()
      await deployCluster({ organizationId, clusterId })
    } catch {
      // Errors are notified by the mutations.
    } finally {
      setIsSaveAndDeployPending(false)
    }
  }

  const value: ClusterProfileContextValue = {
    organizationId,
    clusterId,
    cluster,
    templates,
    configuration,
    profileTree,
    isLoading: isClusterLoading || isTemplateLoading || isConfigurationLoading,
    isError: isClusterError || isTemplateError || isConfigurationError,
    profileValues,
    clusterInputs,
    formKey,
    changeCount: countProfileChanges(profileTree, configuration, profileValues, clusterInputs),
    isSaving: isSavingConfiguration && !isSaveAndDeployPending,
    isDeploying: isSaveAndDeployPending,
    updateProfileConfig,
    updateClusterInput,
    resetChanges,
    saveChanges,
    saveAndDeployChanges,
  }

  return <ClusterProfileContext.Provider value={value}>{children}</ClusterProfileContext.Provider>
}

export function useClusterProfileContext() {
  const context = useContext(ClusterProfileContext)
  if (!context) throw new Error('useClusterProfileContext must be used within a ClusterProfileProvider')
  return context
}
