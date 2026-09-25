import { useParams } from '@tanstack/react-router'
import equal from 'fast-deep-equal'
import {
  type Cluster,
  type ClusterPlatformBindingRequest,
  type ClusterPlatformBindingResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'
import { toast } from '@qovery/shared/ui'
import { type CatalogVariableValue, getCatalogVariableValue } from '@qovery/shared/util-js'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { useDeployCluster } from '../hooks/use-deploy-cluster/use-deploy-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformBinding } from '../platform-configuration/hooks/use-platform-binding'
import { useUpdatePlatformBinding } from '../platform-configuration/hooks/use-update-platform-binding'
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
  binding: ClusterPlatformBindingResponse | null | undefined,
  profileValues: ProfileValues,
  clusterInputs: ClusterInputValues
) {
  const fieldsByComponent = new Map(
    profileTree.flatMap((layer) => layer.children).map((component) => [component.key, component.fields])
  )
  const profileChanges = Object.entries(profileValues).flatMap(([componentKey, values]) => {
    const fields = fieldsByComponent.get(componentKey) ?? []
    const savedValues = applyPlatformConfigurationDefaults(fields, binding?.managedConfig?.[componentKey] ?? {})
    return Object.entries(values).filter(([fieldKey, value]) => {
      const field = fields.find(({ key }) => key === fieldKey)
      return field && isPlatformScalarField(field)
        ? getDisplayedScalarValue(field, value) !== getDisplayedScalarValue(field, savedValues[fieldKey])
        : !equal(value, savedValues[fieldKey])
    })
  })
  const clusterInputChanges = Object.entries(clusterInputs).flatMap(([componentKey, values]) =>
    Object.entries(values).filter(
      ([inputKey, value]) => value !== (binding?.customerProvidedInputs?.[componentKey]?.[inputKey] ?? '')
    )
  )

  return profileChanges.length + clusterInputChanges.length
}

function getBindingRequest(
  template: PlatformTemplateSummaryResponse,
  binding: ClusterPlatformBindingResponse | null | undefined,
  profileValues: ProfileValues,
  clusterInputs: ClusterInputValues
): ClusterPlatformBindingRequest {
  const managedConfig = { ...binding?.managedConfig }
  for (const [componentKey, values] of Object.entries(profileValues)) {
    managedConfig[componentKey] = omitEmptyValues({ ...binding?.managedConfig?.[componentKey], ...values })
  }
  const customerProvidedInputs = { ...binding?.customerProvidedInputs }
  for (const [componentKey, values] of Object.entries(clusterInputs)) {
    customerProvidedInputs[componentKey] = { ...binding?.customerProvidedInputs?.[componentKey], ...values }
  }

  return {
    templateKey: binding?.templateKey ?? template.key,
    templateVersion: binding?.templateVersion ?? template.version,
    layerSelections: binding?.layerSelections,
    managedConfig,
    customerProvidedInputs,
  }
}

interface ClusterProfileContextValue {
  organizationId: string
  clusterId: string
  cluster?: Cluster
  templates?: PlatformTemplateSummaryResponse[]
  binding?: ClusterPlatformBindingResponse | null
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
  const { mutateAsync: updatePlatformBinding, isLoading: isSavingBinding } = useUpdatePlatformBinding()
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
    data: binding,
    isError: isBindingError,
    isLoading: isBindingLoading,
  } = usePlatformBinding({ organizationId, clusterId })
  const selectedTemplate = useMemo(
    () =>
      templates?.find(
        (template) => template.key === binding?.templateKey && template.version === binding?.templateVersion
      ) ?? templates?.[0],
    [binding?.templateKey, binding?.templateVersion, templates]
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

  const saveBinding = async () => {
    if (!selectedTemplate) return
    await updatePlatformBinding({
      organizationId,
      clusterId,
      bindingRequest: getBindingRequest(selectedTemplate, binding, profileValues, clusterInputs),
    })
    // The saved binding now carries the edits, so the local copies can go.
    setProfileValues({})
    setClusterInputs({})
  }

  const saveChanges = async () => {
    try {
      await saveBinding()
      toast('success', 'Profile saved', 'Deploy the cluster to apply the changes.')
    } catch {
      // Errors are notified by the mutation.
    }
  }

  const saveAndDeployChanges = async () => {
    setIsSaveAndDeployPending(true)
    try {
      await saveBinding()
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
    binding,
    profileTree,
    isLoading: isClusterLoading || isTemplateLoading || isBindingLoading,
    isError: isClusterError || isTemplateError || isBindingError,
    profileValues,
    clusterInputs,
    formKey,
    changeCount: countProfileChanges(profileTree, binding, profileValues, clusterInputs),
    isSaving: isSavingBinding && !isSaveAndDeployPending,
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
