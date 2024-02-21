import { type HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
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
  ports: HelmPortRequestPortsInner[]
  onUpdatePorts: (ports: HelmPortRequestPortsInner[]) => void
}

export function NetworkingSetting({ ports, onUpdatePorts, children }: NetworkingSettingProps) {
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const onAddPort = () =>
    openModal({
      content: (
        <NetworkingPortSettingModal
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
      <div className="flex flex-row w-full justify-between">
        <div>
          <Heading className="mb-2">Networking</Heading>
          <p className="text-sm text-neutral-350 mb-2">
            You can expose publicly over HTTP/gRPC the Kubernetes services deployed.
          </p>
          <Popover.Root>
            <Popover.Trigger>
              <span className="text-sm cursor-pointer text-brand-500 hover:text-brand-600 transition font-medium mb-5">
                How it works <Icon className="text-xs" iconName="circle-question" />
              </span>
            </Popover.Trigger>
            <Popover.Content side="left" className="text-neutral-350 text-sm relative" style={{ width: 440 }}>
              <h6 className="text-neutral-400 font-medium mb-2">How it works</h6>
              <p>
                You can expose publicly over HTTP/gRPC the Kubernetes services deployed with this helm chart by
                providing the service name (as defined within the chart) and the port you want to expose. Qovery will
                take care of assigning a domain and configure the TLS for you.
              </p>
              <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/helm/#ports">
                Documentation
              </ExternalLink>
              <Popover.Close className="absolute top-4 right-4">
                <button type="button">
                  <Icon iconName="xmark" className="text-lg leading-4 text-neutral-400" />
                </button>
              </Popover.Close>
            </Popover.Content>
          </Popover.Root>
        </div>
        <Button size="lg" variant="solid" color="brand" onClick={onAddPort}>
          Add port
        </Button>
      </div>
      <form className="w-full">
        <BlockContent title="Services exposed publicly" classNameContent="p-0">
          {ports.length > 0 ? (
            ports.map((port) => {
              const { service_name, internal_port, protocol, namespace, name } = port
              return (
                <div
                  className="flex justify-between w-full items-center gap-3 px-5 py-4 border-b border-neutral-250 last:border-0"
                  key={name}
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-400 font-medium">{service_name}</span>
                    <div className="flex flex-row text-xs gap-2 text-neutral-350">
                      <span>Service port: {internal_port}</span>
                      <span>Protocol: {protocol}</span>
                      <span>Namespace: {namespace}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="md"
                      variant="outline"
                      color="neutral"
                      onClick={() => onEditPort(port)}
                      type="button"
                      data-testid="edit-port"
                    >
                      <Icon iconName="gear" />
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
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
            <div className="text-center my-4 py-5 px-10">
              <Icon iconName="wave-pulse" className="text-neutral-300" />
              <p className="text-neutral-350 font-medium text-xs mt-1 mb-3">No port are set.</p>
            </div>
          )}
        </BlockContent>
        {children}
      </form>
    </Section>
  )
}

export default NetworkingSetting
