import { useMemo } from 'react'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformConfiguration } from '../platform-configuration/hooks/use-platform-configuration'
import { toPlatformCloudVendor, toPlatformClusterMode } from '../platform-configuration/platform-configuration-utils'
import { getProfileTree } from './profile-tree'

export interface UseClusterProfileTreeProps {
  organizationId: string
  clusterId: string
}

// The template saved on the cluster, laid out with the layer statuses of its configuration.
export function useClusterProfileTree({ organizationId, clusterId }: UseClusterProfileTreeProps) {
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
  const isTemplateQueryEnabled = Boolean(clusterMode && cloudProvider)
  const {
    data: templates,
    isError: isTemplateError,
    isLoading: isTemplateLoading,
  } = usePlatformTemplates({
    organizationId,
    clusterMode,
    cloudProvider,
    enabled: isTemplateQueryEnabled,
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
  const profileTree = useMemo(
    () => getProfileTree(selectedTemplate, configuration?.layers),
    [configuration?.layers, selectedTemplate]
  )

  return {
    cluster,
    templates,
    configuration,
    selectedTemplate,
    profileTree,
    isLoading: isClusterLoading || (isTemplateQueryEnabled && isTemplateLoading) || isConfigurationLoading,
    isError: isClusterError || isTemplateError || isConfigurationError,
  }
}

export default useClusterProfileTree
