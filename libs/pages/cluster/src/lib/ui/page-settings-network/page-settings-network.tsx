import { type ClusterRoutingTableResultsInner } from 'qovery-typescript-axios'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, EmptyState, Icon, LoaderSpinner, Section, Tooltip } from '@qovery/shared/ui'

export interface PageSettingsNetworkProps {
  routes?: ClusterRoutingTableResultsInner[]
  onAddRoute: () => void
  onEdit: (currentRoute: ClusterRoutingTableResultsInner) => void
  onDelete: (currentRoute: ClusterRoutingTableResultsInner) => void
  loading: boolean
}

export function PageSettingsNetwork(props: PageSettingsNetworkProps) {
  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="Network"
          description="The Network tab in your cluster settings allows you to update your Qovery VPC route table so that you can perform VPC peering."
        >
          <Button data-testid="add-button" size="md" variant="solid" color="brand" onClick={() => props.onAddRoute()}>
            Add Network
            <Icon iconName="circle-plus" iconStyle="regular" className="ml-2" />
          </Button>
        </SettingsHeading>

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
                  className={`flex w-full items-center justify-between gap-3 p-5 ${
                    props.routes && props.routes.length !== i + 1 ? 'border-b border-neutral-250' : ''
                  }`}
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
                      onClick={() => props.onEdit(currentRoute)}
                    >
                      <Icon iconName="gear" />
                    </Button>
                    <Button
                      data-testid="delete-button"
                      variant="surface"
                      color="neutral"
                      size="md"
                      className="h-9 w-9 justify-center"
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
