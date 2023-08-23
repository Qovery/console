import { ClusterRoutingTableResults } from 'qovery-typescript-axios'
import { LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  LoaderSpinner,
  Tooltip,
} from '@qovery/shared/ui'

export interface PageSettingsNetworkProps {
  routes?: ClusterRoutingTableResults[]
  onAddRoute: () => void
  onEdit: (currentRoute: ClusterRoutingTableResults) => void
  onDelete: (currentRoute: ClusterRoutingTableResults) => void
  loading?: LoadingStatus
}

export function PageSettingsNetwork(props: PageSettingsNetworkProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-neutral-400 mb-2">Network</h1>
            <p className="text-sm text-neutral-400 max-w-lg">
              The Network tab in your cluster settings allows you to update your Qovery VPC route table so that you can
              perform VPC peering.
            </p>
          </div>

          <Button dataTestId="add-button" onClick={() => props.onAddRoute()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add Network
          </Button>
        </div>

        {((props.loading === 'not loaded' || props.loading === 'loading') && props.routes?.length === 0) ||
        !props.routes ? (
          <div className="flex justify-center">
            <LoaderSpinner className="w-4" />
          </div>
        ) : props.routes && props.routes.length > 0 ? (
          <BlockContent classNameContent="" title="Configured network">
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
                  <div className="flex items-center">
                    {currentRoute.description && (
                      <Tooltip side="top" content={currentRoute.description}>
                        <div className="flex items-center">
                          <ButtonIcon
                            className="text-neutral-400 hover:text-neutral-400"
                            style={ButtonIconStyle.FLAT}
                            icon={IconAwesomeEnum.CIRCLE_INFO}
                          />
                        </div>
                      </Tooltip>
                    )}
                    <ButtonIcon
                      className="text-neutral-400 hover:text-neutral-400"
                      style={ButtonIconStyle.FLAT}
                      onClick={() => props.onEdit(currentRoute)}
                      dataTestId="edit-button"
                      icon={IconAwesomeEnum.WHEEL}
                    />
                    <ButtonIcon
                      className="text-neutral-400"
                      onClick={() => props.onDelete(currentRoute)}
                      dataTestId="delete-button"
                      icon={IconAwesomeEnum.TRASH}
                      style={ButtonIconStyle.FLAT}
                    />
                  </div>
                </div>
              ))}
          </BlockContent>
        ) : (
          <EmptyState title="No network are set" description="Define a network for your cluster" />
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#network',
            linkLabel: 'How to configure my cluster',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsNetwork
