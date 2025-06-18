import { type Cluster, type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { CardClusterFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Icon, LoaderSpinner, Section, Tooltip } from '@qovery/shared/ui'
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
                  {cluster?.features
                    ?.filter(({ id }) => id !== 'EXISTING_VPC' && id !== 'KARPENTER')
                    .map((feature) => (
                      <CardClusterFeature
                        key={feature.id}
                        feature={feature}
                        cloudProvider={cluster?.cloud_provider}
                        disabled
                      />
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
