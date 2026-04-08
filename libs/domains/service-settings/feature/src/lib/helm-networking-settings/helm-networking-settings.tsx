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
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { isTryingToRemoveLastPublicPort } from '@qovery/shared/util-services'

export interface HelmNetworkingSettingsProps extends PropsWithChildren {
  helmId: string
  ports: HelmPortRequestPortsInner[]
  onAddPort: (port: HelmPortRequestPortsInner) => Promise<void>
  onEditPort: (originalPort: HelmPortRequestPortsInner, port: HelmPortRequestPortsInner) => Promise<void>
  onRemovePort: (port: HelmPortRequestPortsInner) => Promise<void>
}

export function HelmNetworkingSettings({
  helmId,
  ports,
  onAddPort: onAddPortSubmit,
  onEditPort: onEditPortSubmit,
  onRemovePort: onRemovePortSubmit,
  children,
}: HelmNetworkingSettingsProps) {
  useDocumentTitle('Networking - Service settings')
  const { openModal, closeModal } = useModal()
  const { openModalMultiConfirmation } = useModalMultiConfirmation()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: customDomains } = useCustomDomains({
    serviceId: helmId,
    serviceType: 'HELM',
  })

  const onAddPortClick = () =>
    openModal({
      content: (
        <NetworkingPortSettingModal
          helmId={helmId}
          onSubmit={async (port) => {
            await onAddPortSubmit(port)
            closeModal()
          }}
          onClose={() => {
            closeModal()
          }}
        />
      ),
    })
  const onEditPortClick = (originalPort: HelmPortRequestPortsInner) =>
    openModal({
      content: (
        <NetworkingPortSettingModal
          helmId={helmId}
          port={originalPort}
          onSubmit={async (port) => {
            await onEditPortSubmit(originalPort, port)
            closeModal()
          }}
          onClose={() => {
            closeModal()
          }}
        />
      ),
    })
  const onRemovePortClick = (port: HelmPortRequestPortsInner) => {
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
          action: async () => {
            await onRemovePortSubmit(port)
          },
        })
      : openModalConfirmation({
          title: 'Delete Port',
          confirmationMethod: 'action',
          action: async () => {
            await onRemovePortSubmit(port)
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
          <Button className="gap-2" size="md" variant="solid" color="brand" onClick={onAddPortClick}>
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
                      className="flex w-full items-center justify-between gap-3 border-b border-neutral p-4 py-3 last:border-0"
                      key={name}
                    >
                      <div className="flex flex-col gap-0.5">
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
                          onClick={() => onEditPortClick(port)}
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
                          onClick={() => onRemovePortClick(port)}
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
                <EmptyState title="No ports are set." icon="wave-pulse" />
              )}
            </BlockContent>
            {children}
          </form>
        </div>
      </div>
    </Section>
  )
}
