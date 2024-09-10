import { type HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BlockContent,
  Button,
  ExternalLink,
  Heading,
  Icon,
  Popover,
  Section,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { NetworkingPortSettingModal } from '../networking-port-setting-modal/networking-port-setting-modal'

export interface NetworkingSettingProps extends PropsWithChildren {
  helmId: string
  ports: HelmPortRequestPortsInner[]
  onUpdatePorts: (ports: HelmPortRequestPortsInner[]) => void
  isSetting?: boolean
}

export function NetworkingSetting({
  helmId,
  ports,
  onUpdatePorts,
  isSetting = false,
  children,
}: NetworkingSettingProps) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const onAddPort = () =>
    openModal({
      content: (
        <NetworkingPortSettingModal
          helmId={helmId}
          onSubmit={(port) => {
            onUpdatePorts([...ports, port])
            closeModal()
          }}
          onClose={closeModal}
        />
      ),
    })
  const onEditPort = (originalPort: HelmPortRequestPortsInner) =>
    openModal({
      content: (
        <NetworkingPortSettingModal
          helmId={helmId}
          port={originalPort}
          onSubmit={(port) => {
            onUpdatePorts([...ports.filter((p) => p !== originalPort), port])
            closeModal()
          }}
          onClose={closeModal}
        />
      ),
    })
  const onRemovePort = (port: HelmPortRequestPortsInner) =>
    openModalConfirmation({
      title: 'Delete Port',
      isDelete: true,
      action: () => {
        onUpdatePorts(ports.filter((p) => p !== port))
      },
    })

  return (
    <Section className="items-start">
      {isSetting ? (
        <SettingsHeading
          title="Networking"
          description="You can expose publicly over HTTP/gRPC the Kubernetes services deployed."
        >
          <Button className="gap-2" size="md" variant="solid" color="brand" onClick={onAddPort}>
            Add Port
            <Icon iconName="plus-circle" iconStyle="regular" />
          </Button>
        </SettingsHeading>
      ) : (
        <div className="flex w-full flex-row justify-between">
          <div>
            <Heading className="mb-2">Networking</Heading>
            <p className="mb-2 text-sm text-neutral-350">
              You can expose publicly over HTTP/gRPC the Kubernetes services deployed.
            </p>
            <Popover.Root>
              <Popover.Trigger>
                <span className="mb-5 cursor-pointer text-sm font-medium text-brand-500 transition hover:text-brand-600">
                  How it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
                </span>
              </Popover.Trigger>
              <Popover.Content side="left" className="relative text-sm text-neutral-350" style={{ width: 440 }}>
                <h6 className="mb-2 font-medium text-neutral-400">How it works</h6>
                <p>
                  You can expose publicly over HTTP/gRPC the Kubernetes services deployed with this helm chart by
                  providing the service name (as defined within the chart) and the port you want to expose. Qovery will
                  take care of assigning a domain and configure the TLS for you.
                </p>
                <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/helm/#ports">
                  Documentation
                </ExternalLink>
                <Popover.Close className="absolute right-4 top-4">
                  <button type="button">
                    <Icon iconName="xmark" className="text-lg leading-4 text-neutral-400" />
                  </button>
                </Popover.Close>
              </Popover.Content>
            </Popover.Root>
          </div>
          <Button className="gap-2" size="lg" variant="solid" color="brand" onClick={onAddPort}>
            Add port
            <Icon iconName="plus-circle" />
          </Button>
        </div>
      )}
      <form className="w-full">
        <BlockContent title="Services exposed publicly" classNameContent="p-0">
          {ports.length > 0 ? (
            ports.map((port) => {
              const { service_name, internal_port, protocol, namespace, name } = port
              return (
                <div
                  className="flex w-full items-center justify-between gap-3 border-b border-neutral-250 px-5 py-4 last:border-0"
                  key={name}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-400">{service_name}</span>
                    <div className="flex flex-row gap-2 text-xs text-neutral-350">
                      <span>Service port: {internal_port}</span>
                      <span>Protocol: {protocol}</span>
                      {namespace && <span>Namespace: {namespace}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="md"
                      variant="surface"
                      color="neutral"
                      onClick={() => onEditPort(port)}
                      type="button"
                      data-testid="edit-port"
                    >
                      <Icon iconName="gear" />
                    </Button>
                    <Button
                      size="md"
                      variant="surface"
                      color="neutral"
                      onClick={() => onRemovePort(port)}
                      type="button"
                      data-testid="remove-port"
                    >
                      <Icon iconName="trash" />
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="my-4 px-10 py-5 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-300" />
              <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">No port are set.</p>
            </div>
          )}
        </BlockContent>
        {children}
      </form>
    </Section>
  )
}

export default NetworkingSetting
