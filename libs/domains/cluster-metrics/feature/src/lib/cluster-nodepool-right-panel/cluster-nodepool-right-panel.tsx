import * as Dialog from '@radix-ui/react-dialog'
import { type GetClusterKubernetesEvents200ResponseResultsInner } from 'qovery-typescript-axios'
import { type NodePoolInfoDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren, memo, useState } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import { Badge, Heading, Icon, Section } from '@qovery/shared/ui'
import { dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { DialogRightPanel } from '../dialog-right-panel/dialog-right-panel'

export interface ClusterNodePoolRightPanelProps extends PropsWithChildren {
  organizationId: string
  clusterId: string
  nodePool: NodePoolInfoDto
  events: GetClusterKubernetesEvents200ResponseResultsInner[]
  className?: string
}

export const ClusterNodePoolRightPanel = memo(function ClusterNodePoolRightPanel({
  nodePool,
  events,
  children,
}: ClusterNodePoolRightPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <DialogRightPanel isOpen={isModalOpen} onOpenChange={setIsModalOpen} trigger={children}>
      {isModalOpen && (
        <Section className="flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-1.5">
            <Dialog.Title asChild>
              <Heading level={1}>Events: {upperCaseFirstLetter(nodePool.name)} nodepool</Heading>
            </Dialog.Title>
          </div>
          <div className="flex flex-col gap-2.5">
            {events
              .sort((a, b) => new Date(b.last_occurrence || '').getTime() - new Date(a.last_occurrence || '').getTime())
              .map((event) => (
                <div
                  key={event.created_at}
                  className="flex items-center justify-between rounded border border-neutral-250 bg-neutral-100 px-4 py-2"
                >
                  <div className="flex gap-4">
                    <Icon name={IconEnum.KARPENTER} />
                    <div className="flex flex-col gap-0.5 text-sm text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Badge size="sm" color={event.type === 'warning' ? 'yellow' : 'sky'}>
                          {event.type === 'Normal' ? 'Info' : 'Warning'}
                        </Badge>
                        <span className="font-medium">{event.reason}</span>
                      </span>
                      <span>{event.message}</span>
                    </div>
                  </div>
                  <span
                    title={event.last_occurrence && dateUTCString(event.last_occurrence)}
                    className="text-xs text-neutral-350"
                  >
                    {timeAgo(new Date(event.last_occurrence || ''), true)}
                  </span>
                </div>
              ))}
          </div>
        </Section>
      )}
    </DialogRightPanel>
  )
})

export default ClusterNodePoolRightPanel
