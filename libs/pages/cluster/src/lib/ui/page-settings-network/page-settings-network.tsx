import { type Cluster, type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { CardClusterFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, BlockContent, Button, Icon, InputText, LoaderSpinner, Section, Tooltip } from '@qovery/shared/ui'
import { getClusterFeatureValue, isClusterFeatureEnabled } from '@qovery/shared/util-js'
import AWSExistingVPC from './aws-existing-vpc/aws-existing-vpc'
import GcpExistingVPC from './gcp-existing-vpc/gcp-existing-vpc'

export interface PageSettingsNetworkProps {
  routes?: ClusterRoutingTableResultsInner[]
  onAddRoute: () => void
  onEdit: (currentRoute: ClusterRoutingTableResultsInner) => void
  onDelete: (currentRoute: ClusterRoutingTableResultsInner) => void
  isLoading: boolean
  cluster: Cluster | undefined
}

export function PageSettingsNetwork({
  cluster,
  isLoading,
  routes,
  onAddRoute,
  onEdit,
  onDelete,
}: PageSettingsNetworkProps) {
  const featureExistingVpc = cluster?.features?.find(({ id }) => id === 'EXISTING_VPC')
  const featureExistingVpcValue = featureExistingVpc?.value_object
  const canEditRoutes =
    cluster?.cloud_provider === 'AWS' && cluster?.kubernetes === 'MANAGED' && !featureExistingVpcValue

  const featureExistingVpcContent = match(featureExistingVpcValue)
    .with({ type: 'AWS_USER_PROVIDED_NETWORK' }, (f) => <AWSExistingVPC feature={f.value} />)
    .with({ type: 'GCP_USER_PROVIDED_NETWORK' }, (f) => <GcpExistingVPC feature={f.value} />)
    .otherwise(() => null)

  // Get SCW Static IP feature details
  const staticIpFeature = cluster?.features?.find(({ id }) => id === 'STATIC_IP')
  const isScwStaticIpEnabled =
    cluster?.cloud_provider === 'SCW' && staticIpFeature && isClusterFeatureEnabled(staticIpFeature)

  const getScwStaticIpConfig = (): { gateway_type?: string } | null => {
    if (!staticIpFeature?.value_object) {
      return null
    }
    const valueObject = staticIpFeature.value_object as any
    const value = valueObject.value
    if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'scaleway') {
      return {
        gateway_type: value.gateway_type as string | undefined,
      }
    }
    return null
  }

  const scwStaticIpConfig = getScwStaticIpConfig()

  // Ensure STATIC_IP feature is always shown for SCW clusters
  const enhancedFeatures = () => {
    if (cluster?.cloud_provider !== 'SCW') {
      return cluster?.features || []
    }

    const features = cluster?.features || []
    const hasStaticIp = features.some(({ id }) => id === 'STATIC_IP')

    if (!hasStaticIp) {
      // Create a default disabled STATIC_IP feature for SCW
      return [
        ...features,
        {
          id: 'STATIC_IP',
          title: 'Static IP / Nat Gateways',
          description:
            'Your cluster will only be visible from a fixed number of public IP. On SCW, Public Nat Gateway will be setup.',
          is_cloud_provider_paying_feature: true,
          cloud_provider_feature_documentation: 'https://www.scaleway.com/en/public-gateway/',
          value_object: {
            type: 'BOOLEAN',
            value: false,
          },
        } as any,
      ]
    }

    return features
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="Network configuration"
          description="The Network tab in your cluster settings allows you to view your VPC configuration. You can also update the Qovery VPC route table from this interface to set up VPC peering."
        />

        <div className="mt-2 flex flex-col gap-5">
          {isLoading ? (
            <div className="flex justify-center">
              <LoaderSpinner className="w-4" />
            </div>
          ) : (
            <>
              {canEditRoutes && (
                <BlockContent classNameContent="p-0" title="Routes">
                  {routes?.map((currentRoute, i) => (
                    <div
                      key={i}
                      className="flex w-full items-center justify-between gap-3 border-b border-neutral-250 p-5"
                      data-testid="form-row"
                    >
                      <div className="flex flex-col	">
                        <p data-testid="form-row-target" className="mb-1 text-xs text-neutral-350">
                          Target: <span className="font-medium text-neutral-400">{currentRoute.target}</span>
                        </p>
                        <p data-testid="form-row-destination" className="text-xs text-neutral-350">
                          Destination: <span className="font-medium text-neutral-400">{currentRoute.destination}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentRoute.description && (
                          <Tooltip side="top" content={currentRoute.description}>
                            <div className="mr-1 flex items-center">
                              <Icon iconName="circle-info" className="text-sm text-neutral-400" />
                            </div>
                          </Tooltip>
                        )}
                        <Button
                          data-testid="edit-button"
                          variant="surface"
                          color="neutral"
                          size="md"
                          className="h-9 w-9 justify-center"
                          onClick={() => onEdit(currentRoute)}
                        >
                          <Icon iconName="gear" />
                        </Button>
                        <Button
                          data-testid="delete-button"
                          variant="surface"
                          color="neutral"
                          size="md"
                          className="h-9 w-9 justify-center"
                          onClick={() => onDelete(currentRoute)}
                        >
                          <Icon iconName="trash" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex w-full items-center justify-end gap-3 px-5 py-2">
                    <Button
                      data-testid="add-button"
                      size="sm"
                      variant="solid"
                      color="brand"
                      onClick={() => onAddRoute()}
                    >
                      Add route
                      <Icon iconName="circle-plus" iconStyle="regular" className="ml-1" />
                    </Button>
                  </div>
                </BlockContent>
              )}

              {featureExistingVpcValue ? (
                featureExistingVpcContent
              ) : (
                <BlockContent title="Configured network features" classNameContent="p-0">
                  {enhancedFeatures()
                    ?.filter(
                      ({ id }) =>
                        id &&
                        id !== 'EXISTING_VPC' &&
                        id !== 'KARPENTER' &&
                        !id.includes('CONTROL_PLANE') &&
                        !id.includes('KAPSULE')
                    )
                    .map((feature) => (
                      <CardClusterFeature
                        key={feature.id}
                        feature={feature}
                        cloudProvider={cluster?.cloud_provider}
                        disabled
                        badge={
                          feature.id === 'STATIC_IP' && cluster?.cloud_provider === 'SCW' ? (
                            <Badge color="sky" variant="surface" size="sm">
                              Coming Soon
                            </Badge>
                          ) : undefined
                        }
                      >
                        {feature.id === 'STATIC_IP' && cluster?.cloud_provider === 'SCW' && (
                          <div className="mt-4 space-y-3">
                            <InputText
                              label="NAT Gateway Type"
                              name="gateway_type"
                              value={
                                scwStaticIpConfig?.gateway_type === 'VPC_GW_S'
                                  ? 'VPC GW S (20 Gbps bandwidth)'
                                  : scwStaticIpConfig?.gateway_type === 'VPC_GW_M'
                                    ? 'VPC GW M (200 Gbps bandwidth)'
                                    : scwStaticIpConfig?.gateway_type === 'VPC_GW_L'
                                      ? 'VPC GW L (1 Tbps bandwidth)'
                                      : scwStaticIpConfig?.gateway_type || 'N/A'
                              }
                              disabled
                            />
                          </div>
                        )}
                      </CardClusterFeature>
                    ))}
                </BlockContent>
              )}
            </>
          )}
        </div>
      </Section>
    </div>
  )
}

export default PageSettingsNetwork
