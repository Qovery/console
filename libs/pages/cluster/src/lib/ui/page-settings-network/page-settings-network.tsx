import { type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { BlockContent, Button, EmptyState, Heading, Icon, LoaderSpinner, Section, Tooltip } from '@qovery/shared/ui'

export interface PageSettingsNetworkProps {
  routes?: ClusterRoutingTableResultsInner[]
  onAddRoute: () => void
  onEdit: (currentRoute: ClusterRoutingTableResultsInner) => void
  onDelete: (currentRoute: ClusterRoutingTableResultsInner) => void
  loading: boolean
}

export function PageSettingsNetwork(props: PageSettingsNetworkProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <Heading className="mb-2">Network</Heading>
            <p className="text-sm text-neutral-400 max-w-lg">
              The Network tab in your cluster settings allows you to update your Qovery VPC route table so that you can
              perform VPC peering.
            </p>
          </div>

          <Button data-testid="add-button" size="lg" variant="solid" color="brand" onClick={() => props.onAddRoute()}>
            Add Network
            <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
          </Button>
        </div>

        {(props.loading && props.routes?.length === 0) || !props.routes ? (
          <div className="flex justify-center">
            <LoaderSpinner className="w-4" />
          </div>
        ) : props.routes && props.routes.length > 0 ? (
          <BlockContent classNameContent="p-0" title="Configured network">
            {props.routes &&
              props.routes.map((currentRoute, i) => (
                <div
                  key={i}
                  className={`flex justify-between w-full items-center gap-3 p-5 ${
                    props.routes && props.routes.length !== i + 1 ? 'border-b border-neutral-250' : ''
                  }`}
                  data-testid="form-row"
                >
                  <div className="flex flex-col	">
                    <p data-testid="form-row-target" className="text-xs text-neutral-350 mb-1">
                      Target: <span className="text-neutral-400 font-medium">{currentRoute.target}</span>
                    </p>
                    <p data-testid="form-row-destination" className="text-xs text-neutral-350">
                      Destination: <span className="text-neutral-400 font-medium">{currentRoute.destination}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentRoute.description && (
                      <Tooltip side="top" content={currentRoute.description}>
                        <div className="flex items-center mr-1">
                          <Icon iconName="circle-info" className="text-sm text-neutral-400" />
                        </div>
                      </Tooltip>
                    )}
                    <Button
                      data-testid="edit-button"
                      variant="outline"
                      color="neutral"
                      size="md"
                      className="justify-center w-9 h-9"
                      onClick={() => props.onEdit(currentRoute)}
                    >
                      <Icon iconName="gear" />
                    </Button>
                    <Button
                      data-testid="delete-button"
                      variant="outline"
                      color="neutral"
                      size="md"
                      className="justify-center w-9 h-9"
                      onClick={() => props.onDelete(currentRoute)}
                    >
                      <Icon iconName="trash" />
                    </Button>
                  </div>
                </div>
              ))}
          </BlockContent>
        ) : (
          <EmptyState title="No network are set" description="Define a network for your cluster" />
        )}
      </Section>
    </div>
  )
}

export default PageSettingsNetwork
