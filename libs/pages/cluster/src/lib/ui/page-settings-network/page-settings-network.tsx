import { ServicePort } from 'qovery-typescript-axios'
import { LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  EmptyState,
  HelpSection,
  IconAwesomeEnum,
  InputText,
  LoaderSpinner,
} from '@qovery/shared/ui'

export interface PageSettingsNetworkProps {
  ports?: ServicePort[]
  onAddNetwork: () => void
  onEdit: (customPort: ServicePort) => void
  onDelete: (customPort: ServicePort) => void
  loading?: LoadingStatus
}

export function PageSettingsNetwork(props: PageSettingsNetworkProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Network</h1>
            <p className="text-sm text-text-500 max-w-lg">
              The Network tab in your cluster settings allows you to update your Qovery VPC route table so that you can
              perform VPC peering.
            </p>
          </div>

          <Button dataTestId="add-button" onClick={() => props.onAddNetwork()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add Network
          </Button>
        </div>

        {(props.loading === 'not loaded' || props.loading === 'loading') && props.ports?.length === 0 ? (
          <div className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : props.ports && props.ports.length > 0 ? (
          <BlockContent title="Configured network">
            {props.ports &&
              props.ports.map((customPort, i) => (
                <div
                  key={`port-${customPort.id}`}
                  className={`flex justify-between w-full items-center gap-3 ${
                    props.ports && props.ports.length !== i + 1 ? 'mb-5' : ''
                  }`}
                  data-testid="form-row"
                >
                  <InputText
                    name={`port-${customPort.internal_port}-${customPort.id}`}
                    className="shrink-0 grow flex-1"
                    value={customPort.internal_port}
                    label="Application port"
                    disabled
                  />
                  <InputText
                    name={`port-${customPort.external_port}-${customPort.id}`}
                    className="shrink-0 grow flex-1"
                    value={customPort.external_port || '-'}
                    label="External port"
                    disabled
                  />
                  <ButtonIcon
                    className="text-text-500 hover:text-text-700"
                    style={ButtonIconStyle.FLAT}
                    onClick={() => props.onEdit(customPort)}
                    dataTestId="edit-button"
                    icon={IconAwesomeEnum.WHEEL}
                  />
                  <ButtonIcon
                    className="text-text-500"
                    onClick={() => props.onDelete(customPort)}
                    dataTestId="delete-button"
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.FLAT}
                  />
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
