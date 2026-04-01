import { type HelmPortRequestPortsInner } from 'qovery-typescript-axios'
import { ServiceType } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useCustomDomains } from '@qovery/domains/custom-domains/feature'
import { NetworkingPortSettingModal } from '@qovery/domains/service-helm/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  BlockContent,
  Button,
  EmptyState,
  Icon,
  Section,
  useModal,
  useModalConfirmation,
  useModalMultiConfirmation,
} from '@qovery/shared/ui'
import { isTryingToRemoveLastPublicPort } from '@qovery/shared/util-services'

export interface HelmNetworkingSettingsProps extends PropsWithChildren {
  helmId: string
  ports: HelmPortRequestPortsInner[]
  onUpdatePorts: (ports: HelmPortRequestPortsInner[]) => void
  isSetting?: boolean
}

export function HelmNetworkingSettings({
  helmId,
  ports,
  onUpdatePorts,
  isSetting = false,
  children,
}: HelmNetworkingSettingsProps) {
  const { openModal, closeModal } = useModal()
  const { openModalMultiConfirmation } = useModalMultiConfirmation()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: customDomains } = useCustomDomains({
    serviceId: helmId,
    serviceType: 'HELM',
  })

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
  const onRemovePort = (port: HelmPortRequestPortsInner) => {
    const isTryingToRemoveLastPort = isTryingToRemoveLastPublicPort(ServiceType.HELM, ports, port, customDomains)

    isTryingToRemoveLastPort
      ? openModalMultiConfirmation({
          title: 'Delete port',
          isDelete: true,
          description: 'Please confirm deletion',
          warning: (
            <p>
              You are about to remove your last public port.
              <br />
              Please confirm that you understand the impact of this operation.
            </p>
          ),
          checks: ['I understand this action is irreversible and will delete all linked domains'],
          action: () => {
            onUpdatePorts(ports.filter((p) => p !== port))
          },
        })
      : openModalConfirmation({
          title: 'Delete Port',
          confirmationMethod: 'action',
          action: () => {
            onUpdatePorts(ports.filter((p) => p !== port))
          },
        })
  }

  return (
    <Section className="px-8 pb-8 pt-6">
      <div className="space-y-6">
        <SettingsHeading
          title="Networking"
          description="You can expose publicly over HTTP/gRPC the Kubernetes services deployed."
        >
          <Button className="gap-2" size="md" variant="solid" color="brand" onClick={onAddPort}>
            Add Port
            <Icon iconName="plus-circle" iconStyle="regular" />
          </Button>
        </SettingsHeading>

        <div className="max-w-content-with-navigation-left">
          <form className="w-full">
            <BlockContent title="Services exposed publicly" classNameContent="p-0">
              {ports.length > 0 ? (
                ports.map((port) => {
                  const { service_name, internal_port, protocol, namespace, name } = port
                  return (
                    <div
                      className="flex w-full items-center justify-between gap-3 border-b border-neutral p-4 last:border-0"
                      key={name}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral">{service_name}</span>
                        <div className="flex flex-row gap-2 text-xs text-neutral-subtle">
                          <span>Service port: {internal_port}</span>
                          <span>Protocol: {protocol}</span>
                          {namespace && <span>Namespace: {namespace}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="md"
                          variant="outline"
                          iconOnly
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
                          iconOnly
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
                <EmptyState title="No port are set." icon="wave-pulse" />
              )}
            </BlockContent>
            {children}
          </form>
        </div>
      </div>
    </Section>
  )
}
