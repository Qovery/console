import { ServicePort } from 'qovery-typescript-axios'
import { PortData } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  ButtonStyle,
  EmptyState,
  IconAwesomeEnum,
} from '@qovery/shared/ui'

export interface FlowCreatePortProps {
  onAddPort: () => void
  onRemovePort: (port: PortData | ServicePort) => void
  ports?: PortData[] | ServicePort[]
  onBack?: () => void
  onEdit?: (port: PortData | ServicePort) => void
  isSetting?: boolean
  onSubmit?: () => void
}

export function FlowCreatePort({
  ports,
  onAddPort,
  onRemovePort,
  isSetting,
  onSubmit,
  onBack,
  onEdit,
}: FlowCreatePortProps) {
  return (
    <div>
      <div className="flex justify-between mb-10">
        <div>
          <div className="flex justify-between mb-2 items-center">
            <h3 className="text-text-700 text-lg">{isSetting ? 'Port' : 'Set port'}</h3>
          </div>

          <p className={isSetting ? 'text-sm text-text-500 max-w-lg' : 'text-xs text-text-500'}>
            Declare TCP/UDP ports used by your application. Declared ports are accessible from other applications within
            the same environment. You can also expose them on the internet by making them public. Declared ports are
            also used to check the liveness/readiness of your application
          </p>
        </div>

        {isSetting && (
          <Button dataTestId="add-button" onClick={() => onAddPort()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add Port
          </Button>
        )}
      </div>

      <div className="mb-10">
        {!isSetting || (ports && ports.length > 0) ? (
          <BlockContent title="Configured ports" classNameContent="">
            {ports &&
              ports.map((customPort, i) => (
                <div
                  key={i}
                  className="flex justify-between w-full items-center gap-3 px-5 py-4 border-b border-element-light-lighter-500 last:border-0"
                  data-testid="form-row"
                >
                  <div className="text-xs">
                    <span className="text-text-600 font-medium">
                      Application Port:{' '}
                      {(customPort as PortData).application_port || (customPort as ServicePort).internal_port}
                    </span>
                    <p className="flex gap-3 text-text-400 mt-1">
                      <span>
                        Public:{' '}
                        {(customPort as PortData).is_public || (customPort as ServicePort).publicly_accessible
                          ? 'Yes'
                          : 'No'}
                      </span>
                      {(customPort as ServicePort).publicly_accessible && (
                        <span>Protocol: {(customPort as ServicePort).protocol}</span>
                      )}
                      {(customPort as ServicePort).publicly_accessible && (
                        <span>Port Name: {(customPort as ServicePort).name}</span>
                      )}
                      {((customPort as ServicePort).publicly_accessible || (customPort as PortData).is_public) && (
                        <span>
                          External Port:{' '}
                          {(customPort as ServicePort).external_port || (customPort as PortData).external_port}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    {onEdit && (
                      <ButtonIcon
                        className="mr-2 !bg-transparent hover:!bg-element-light-lighter-400"
                        style={ButtonIconStyle.STROKED}
                        size={ButtonSize.REGULAR}
                        onClick={() => onEdit(customPort)}
                        dataTestId="edit-button"
                        icon={IconAwesomeEnum.WHEEL}
                      />
                    )}
                    {onRemovePort && (
                      <ButtonIcon
                        className="!bg-transparent hover:!bg-element-light-lighter-400"
                        style={ButtonIconStyle.STROKED}
                        size={ButtonSize.REGULAR}
                        onClick={() => onRemovePort(customPort)}
                        dataTestId="delete-button"
                        icon={IconAwesomeEnum.TRASH}
                      />
                    )}
                  </div>
                </div>
              ))}
            {!isSetting && (
              <div className="flex justify-end items-center py-3 px-4">
                <Button
                  size={ButtonSize.TINY}
                  iconRight={IconAwesomeEnum.CIRCLE_PLUS}
                  className="btn--no-min-w"
                  onClick={onAddPort}
                >
                  Add port
                </Button>
              </div>
            )}
          </BlockContent>
        ) : (
          <EmptyState title="No port are set" description="Define a custom port for your application" />
        )}
      </div>

      {!isSetting && (
        <div className="flex justify-between">
          <Button
            onClick={onBack}
            className="btn--no-min-w"
            type="button"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </Button>
          <Button
            dataTestId="button-submit"
            onClick={onSubmit}
            disabled={ports?.length === 0}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}

export default FlowCreatePort
