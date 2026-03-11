import { Button, Icon, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface PortListRowsProps<TPort> {
  ports?: TPort[]
  hidePortName?: boolean
  getKey: (port: TPort) => string
  hasHealthcheck: (port: TPort) => boolean
  getApplicationPort: (port: TPort) => number | undefined
  getIsPublic: (port: TPort) => boolean
  getProtocol: (port: TPort) => string
  getName: (port: TPort) => string | undefined
  getExternalPort: (port: TPort) => number | undefined
  getPublicPath: (port: TPort) => string | undefined
  getPublicPathRewrite: (port: TPort) => string | undefined
  onEditPort: (port: TPort) => void
  onRemovePort: (port: TPort) => void
}

export function PortListRows<TPort>({
  ports,
  hidePortName = true,
  getKey,
  hasHealthcheck,
  getApplicationPort,
  getIsPublic,
  getProtocol,
  getName,
  getExternalPort,
  getPublicPath,
  getPublicPathRewrite,
  onEditPort,
  onRemovePort,
}: PortListRowsProps<TPort>) {
  return (
    <>
      {ports?.map((port) => {
        const isHealthcheckRunning = hasHealthcheck(port)
        const isPublic = getIsPublic(port)

        return (
          <div
            key={getKey(port)}
            className="grid w-full grid-cols-[auto_80px] items-center gap-4 border-b border-neutral px-5 py-4 last:border-0"
            data-testid="form-row"
          >
            <div
              className={twMerge(
                'grid w-full gap-4',
                isHealthcheckRunning ? 'grid-cols-[20px_1fr]' : 'grid-cols-[1fr]'
              )}
            >
              {isHealthcheckRunning ? (
                <Tooltip side="top" content="A health check is running on this port">
                  <div className="inline-flex items-center">
                    <Icon iconName="shield-check" className="flex w-5 justify-center text-positive" />
                  </div>
                </Tooltip>
              ) : null}
              <div className="text-xs">
                <span className="font-medium text-neutral">Application Port: {getApplicationPort(port)}</span>
                <p className="mt-1 flex flex-wrap gap-x-3 text-neutral-subtle">
                  <span>Public: {isPublic ? 'Yes' : 'No'}</span>
                  <span>Protocol: {getProtocol(port)}</span>
                  {!hidePortName && isPublic && getName(port) && <span>Port Name: {getName(port)}</span>}
                  {isPublic && <span>External Port: {getExternalPort(port)}</span>}
                  {getPublicPath(port) && <span>Public Path: {getPublicPath(port)}</span>}
                  {getPublicPathRewrite(port) && <span>Rewrite Public Path: {getPublicPathRewrite(port)}</span>}
                </p>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                data-testid="edit-button"
                variant="surface"
                color="neutral"
                size="md"
                type="button"
                iconOnly
                onClick={() => onEditPort(port)}
              >
                <Icon iconName="gear" />
              </Button>

              <Button
                data-testid="delete-button"
                variant="surface"
                color="neutral"
                size="md"
                type="button"
                iconOnly
                onClick={() => onRemovePort(port)}
              >
                <Icon iconName="trash" />
              </Button>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default PortListRows
