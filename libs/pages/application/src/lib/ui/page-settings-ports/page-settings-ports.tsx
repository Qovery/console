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
  InputToggle,
  LoaderSpinner,
} from '@qovery/shared/ui'

export interface PageSettingsPortsProps {
  ports?: ServicePort[]
  onAddPort: () => void
  onEdit: (customPort: ServicePort) => void
  onDelete: (customPort: ServicePort) => void
  loading?: LoadingStatus
}

export function PageSettingsPorts(props: PageSettingsPortsProps) {
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8  max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Port</h1>
            <p className="text-sm text-text-500 max-w-lg">
              Declare TCP/UDP ports used by your application. Declared ports are accessible from other applications
              within the same environment. You can also expose them on the internet by making them public. Declared
              ports are also used to check the liveness/readiness of your application.
            </p>
          </div>

          <Button dataTestId="add-button" onClick={() => props.onAddPort()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add Port
          </Button>
        </div>

        {(props.loading === 'not loaded' || props.loading === 'loading') && props.ports?.length === 0 ? (
          <div className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : props.ports && props.ports.length > 0 ? (
          <BlockContent title="Configured ports">
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
                  <div className="flex items-center ml-1 mr-4">
                    <InputToggle
                      className="shrink-0 grow flex-1"
                      value={customPort.publicly_accessible}
                      disabled
                      small
                    />
                    <span className="text-text-600 text-ssm font-medium">Publicly exposed</span>
                  </div>
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
          <EmptyState title="No port are set" description="Define a custom port for your application" />
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#ports',
            linkLabel: 'How to configure my application',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageSettingsPorts
